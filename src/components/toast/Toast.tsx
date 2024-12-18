// import { Localization } from "../../config/localization/localization";

interface ToastComponentProps {
  title: string;
  description?: string;
}

const ToastGradient = (props: ToastComponentProps) => {
  return (
    <div className="toast-wrapper">
      <span className="title">
        {props.title}
      </span>
      <span className="desc">
        {props.description ? props.description : null}
      </span>
    </div>
  );
};

export default ToastGradient;
