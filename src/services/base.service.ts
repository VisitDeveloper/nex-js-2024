// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Builder, parseStringPromise } from "xml2js";

export enum METHOD {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
  PATCH = "PATCH",
  HEAD = "HEAD",
}

export interface NextOptionsFetch {
  method: METHOD;
  body?: any;
  headers: any;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

export class BaseServiceClass {
  baseURL?: string;
  revalidateSeconds?: number;
  cacheStatus?: any;

  constructor(baseURL?: string, revalidateSeconds?: number, cacheStatus?: any) {
    this.baseURL =
      process.env.NEXT_PUBLIC_BASE_API_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      baseURL;
    this.revalidateSeconds = revalidateSeconds;
    this.cacheStatus = cacheStatus;
  }

  private createRequestOptions(
    method: METHOD,
    body: any,
    customHeaders: any = {},
    credentials: RequestCredentials = "include",
    signal?: AbortSignal
  ): NextOptionsFetch {
    const headers: Record<string, string> = Object.assign(
      {
        "Content-Type": "application/json",
        cache: "no-store",
        ...customHeaders,
      },
      this.revalidateSeconds
        ? { next: { revalidate: this.revalidateSeconds } }
        : {},
      this.cacheStatus ? { cache: this.cacheStatus } : {}
    );

    const options: NextOptionsFetch = {
      method,
      body,
      headers,
      credentials,
      signal,
    };

    if (body) {
      if (body instanceof FormData) {
        delete headers["Content-Type"];
        options.body = body;
      } else if (typeof body === "object") {
        options.body = JSON.stringify(body);
      } else {
        options.body = body;
      }
    }

    return options;
  }

  async fetchHelper(
    url?: string,
    method: METHOD = METHOD.GET,
    body: any = null,
    customHeaders: any = {},
    credentials: RequestCredentials = "include",
    signal?: AbortSignal
  ): Promise<any> {
    const fullURL = `${this.baseURL}/${url}`;
    const options = this.createRequestOptions(
      method,
      body,
      customHeaders,
      credentials,
      signal
    );

    try {
      const response = await fetch(fullURL, options);

      // Check if response is not OK (status 2xx)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.statusText}`);
      }

      // If response is OK, return the parsed data
      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Fetch error: ${error.message}`);
        throw error;
      }
    }
  }
}

export class SoapService {
  private baseURL?: string;

  constructor(baseURL?: string) {
    this.baseURL = process.env.NEXT_PUBLIC_BASE_URL || baseURL;
  }

  async callSoapService(
    url: string,
    method: METHOD = METHOD.GET,
    body: any
  ): Promise<any> {
    const fullURL = `${this.baseURL}/${url}`;

    // ساخت پیام XML از body
    const builder = new Builder();
    const xmlBody = builder.buildObject(body);

    const headers = {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: method,
    };

    try {
      const response = await fetch(fullURL, {
        method: "POST",
        headers: headers,
        body: xmlBody,
      });

      if (!response.ok) {
        throw new Error(`SOAP Request failed: ${response.statusText}`);
      }

      const responseText = await response.text();

      // تبدیل XML پاسخ به JSON
      const parsedResponse = await parseStringPromise(responseText);
      return parsedResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Fetch error: ${error.message}`);
        throw error;
      }
    }
  }
}

class ServiceAdapter {
  private fetchService: BaseServiceClass;
  private soapService: SoapService;

  constructor(fetchService: BaseServiceClass, soapService: SoapService) {
    this.fetchService = fetchService;
    this.soapService = soapService;
  }

  async callService(
    url: string,
    method: METHOD,
    body?: any,
    headers?: any,
    useSoap: boolean = false
  ): Promise<any> {
    if (useSoap) {
      // Using SOAP service
      return this.soapService.callSoapService(url, method, body);
    } else {
      // Using Fetch service
      return this.fetchService.fetchHelper(url, method, body, headers);
    }
  }
}

// singleton pattern for service Adapter you should just use!
const fetchService = new BaseServiceClass("https://api.example.com", 60);
const soapService = new SoapService();
const serviceAdapter = new ServiceAdapter(fetchService, soapService);
export default Object.freeze(serviceAdapter);

// Example Usage
// const fetchService = new BaseServiceClass("https://api.example.com", 60);
// const soapService = new SoapService();
// const serviceAdapter = new ServiceAdapter(fetchService, soapService);

// Calling Fetch Service
// serviceAdapter.callService("users", METHOD.GET).then((res) => console.log("Fetch Service:", res));

// Calling SOAP Service
// serviceAdapter.callService("users", METHOD.POST, { id: 1 }, {}, true).then((res) => console.log("SOAP Service:", res));

// soap test request
// async function testSoapService() {
//     const soapService = new SoapService("https://example.com/soap");

//     const body = {
//         Envelope: {
//             $: {
//                 "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
//                 "xmlns:web": "http://example.com/webservice",
//             },
//             Header: {},
//             Body: {
//                 "web:MyRequest": {
//                     "web:Parameter1": "Value1",
//                     "web:Parameter2": "Value2",
//                 },
//             },
//         },
//     };

//     try {
//         const response = await soapService.callSoapService("endpoint", "MyAction", body);
//         console.log("SOAP Response:", response);
//     } catch (error) {
//         console.error("Error in SOAP request:", error);
//     }
// }

// testSoapService();
