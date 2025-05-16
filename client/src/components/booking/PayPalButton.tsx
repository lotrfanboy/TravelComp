import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess: (paymentData: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
  onSuccess,
  onCancel,
  onError
}: PayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/api/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/api/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  };

  const handleApprove = async (data: any) => {
    console.log("PayPal payment approved", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("PayPal capture result", orderData);
      onSuccess(orderData);
    } catch (error) {
      console.error("PayPal capture error", error);
      if (onError) onError(error);
    }
  };

  const handleCancel = async (data: any) => {
    console.log("PayPal payment cancelled", data);
    if (onCancel) onCancel();
  };

  const handleError = async (data: any) => {
    console.error("PayPal error", data);
    if (onError) onError(data);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        if (onError) onError(e);
      }
    };

    loadPayPalSDK();
  }, []);

  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/api/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });

      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error("PayPal checkout error", e);
          if (onError) onError(e);
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error("PayPal initialization error", e);
      if (onError) onError(e);
    }
  };

  return (
    <div className="w-full p-4 border border-gray-200 rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-4">Pay with PayPal</h3>
      <paypal-button 
        id="paypal-button" 
        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md flex items-center justify-center cursor-pointer transition-colors"
      >
        PayPal Checkout
      </paypal-button>
    </div>
  );
}