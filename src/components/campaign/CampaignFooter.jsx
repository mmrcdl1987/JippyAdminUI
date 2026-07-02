import React from "react";
import "../../styles/campaign/CampaignFooter.css";

function CampaignFooter({
  currentStep,
  nextStep,
  previousStep,
}) {
  return (
    <div className="campaign-footer">

      <div className="footer-left">

        <span className="step-text">
          Step {currentStep} of 3
        </span>

      </div>

      <div className="footer-right">

        <button
          className="btn-secondary"
          onClick={previousStep}
          disabled={currentStep === 1}
        >
          ← Back
        </button>

        <button
          className="btn-outline"
        >
          Save Draft
        </button>

        {currentStep < 3 ? (

          <button
            className="btn-primary"
            onClick={nextStep}
          >
            Next →
          </button>

        ) : (

          <button
            className="btn-success"
          >
            Publish Campaign
          </button>

        )}

      </div>

    </div>
  );
}

export default CampaignFooter;