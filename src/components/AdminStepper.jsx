import React from "react";

export const AdminStepper = ({ currentStep }) => {
  return (
    <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse justify-evenly mb-5">
      <li
        className={`flex items-center space-x-2.5 rtl:space-x-reverse ${
          currentStep === 1 ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 border rounded-full shrink-0 ${
            currentStep === 1 ? "border-blue-600" : "border-gray-500"
          }`}
        >
          1
        </span>
        <span>
          <h3 class="font-medium leading-tight">Merchant Info</h3>
        </span>
      </li>
      <li
        className={`flex items-center space-x-2.5 rtl:space-x-reverse ${
          currentStep === 2 ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 border rounded-full shrink-0 ${
            currentStep === 2 ? "border-blue-600" : "border-gray-500"
          }`}
        >
          2
        </span>
        <span>
          <h3 class="font-medium leading-tight">Company Info</h3>
        </span>
      </li>
      <li
        className={`flex items-center space-x-2.5 rtl:space-x-reverse ${
          currentStep === 3 ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 border rounded-full shrink-0 ${
            currentStep === 3 ? "border-blue-600" : "border-gray-500"
          }`}
        >
          3
        </span>
        <span>
          <h3 class="font-medium leading-tight">Director Info</h3>
        </span>
      </li>
      <li
        className={`flex items-center space-x-2.5 rtl:space-x-reverse ${
          currentStep === 4 ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <span
          className={`flex items-center justify-center w-8 h-8 border rounded-full shrink-0 ${
            currentStep === 4 ? "border-blue-600" : "border-gray-500"
          }`}
        >
          4
        </span>
        <span>
          <h3 class="font-medium leading-tight">Scheme Selection</h3>
        </span>
      </li>
    </ol>
  );
};