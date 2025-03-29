import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/general.action";
import React from "react";

const Interveiw = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview Generation</h3>

      <Agent
        userName={user?.name ?? ""}
        userId={user?.id ?? ""}
        type="generate"
      />
    </>
  );
};

export default Interveiw;
