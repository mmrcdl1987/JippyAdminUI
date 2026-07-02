import React, { useState } from "react";

import "../styles/PlanCampaign.css";

import CampaignStepper from "../components/campaign/CampaignStepper";
import CampaignLocation from "../components/campaign/CampaignLocation";
import CampaignConfiguration from "../components/campaign/CampaignConfiguration";
import CampaignPreview from "../components/campaign/CampaignPreview";
import CampaignFooter from "../components/campaign/CampaignFooter";

function PlanCampaign() {

  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {

    if (currentStep < 3) {

      setCurrentStep(currentStep + 1);

    }

  };

  const previousStep = () => {

    if (currentStep > 1) {

      setCurrentStep(currentStep - 1);

    }

  };

  const renderStep = () => {

    switch (currentStep) {

      case 1:
        return <CampaignLocation />;

      case 2:
        return <CampaignConfiguration />;

      case 3:
        return <CampaignPreview />;

      default:
        return <CampaignLocation />;

    }

  };

  return (

    <div className="campaign-container">

      <div className="campaign-header">

        <div>

          <h1>Campaign Scheduler</h1>

          <p>
            Create and manage outlet campaigns.
          </p>

        </div>

      </div>

      <CampaignStepper
        currentStep={currentStep}
      />

      {renderStep()}

      <CampaignFooter
        currentStep={currentStep}
        nextStep={nextStep}
        previousStep={previousStep}
      />

    </div>

  );

}

export default PlanCampaign;