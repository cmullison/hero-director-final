import React from "react";

const Lit: React.FC = () => {
  return (
    <>
      <div className="flex flex-col bg-background w-full h-full">
        <iframe
          src="https://lit.mulls.io/dashboard"
          className="w-full h-full bg-background min-h-[80vh] border-0"
          title="Lit Analytics Dashboard"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
        />
      </div>
    </>
  );
};

export default Lit;
