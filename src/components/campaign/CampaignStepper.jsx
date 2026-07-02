import React from "react";
import "../../styles/campaign/CampaignStepper.css";

const CampaignStepper = ({ currentStep }) => {
  const steps = [
    {
      id: 1,
      title: "Location & Outlets",
    },
    {
      id: 2,
      title: "Campaign Configuration",
    },
    {
      id: 3,
      title: "Preview & Publish",
    },
  ];

  return (
    <div className="campaign-stepper">

      {steps.map((step, index) => (
        <React.Fragment key={step.id}>

          <div
            className={`step-item ${
              currentStep === step.id
                ? "active"
                : currentStep > step.id
                ? "completed"
                : ""
            }`}
          >
            <div className="step-circle">

              {currentStep > step.id ? "✓" : step.id}

            </div>

            <div className="step-title">

              {step.title}

            </div>

          </div>

          {index !== steps.length - 1 && (

            <div
              className={`step-line ${
                currentStep > step.id
                  ? "completed"
                  : ""
              }`}
            ></div>

          )}

        </React.Fragment>
      ))}

    </div>
  );
};

export default CampaignStepper;