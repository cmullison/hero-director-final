import React from "react";
const Lit: React.FC = () => {
  return (
    <>
      <div className="flex flex-col h-full">
        <iframe
          src="https://r2.mulls.io"
          className="w-full h-full min-h-[80vh] border-0"
          title="R2 Storage"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
        />
      </div>
    </>
  );
};

export default Lit;
