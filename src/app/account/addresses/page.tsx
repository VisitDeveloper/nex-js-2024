import AddressBookClient from "components/specific_elements/account/address-book-client";

export default function AddressesPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Address book</h1>
        <p className="mt-1 text-sm text-zinc-600">Shipping addresses used for your orders.</p>
      </div>
      <AddressBookClient />
    </main>
  );
}
