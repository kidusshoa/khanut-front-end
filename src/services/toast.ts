import { toast } from "react-hot-toast";

export const toastService = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    });
  },
  
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
      icon: "ℹ️",
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: "top-right",
      icon: "⚠️",
      style: {
        background: "#FFF3CD",
        color: "#856404",
      },
    });
  },
  
  apiError: (error: any) => {
    let message = "An error occurred. Please try again.";
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    });
  },
  
  loading: (message: string = "Loading...") => {
    return toast.loading(message, {
      position: "top-right",
    });
  },
  
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
};
