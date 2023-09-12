import { api } from "../utils/api";
import { useState } from "react";

const Seed: React.FC = () => {
  const seed = api.outing.seedWeekendLeave.useMutation();

  const [seedNo, setSeed] = useState(100);

  return (
    <div className="flex flex-row gap-3 p-4">
      <input
        type="number"
        name=""
        id=""
        value={seedNo}
        className="rounded-md border border-black bg-white p-2"
        onChange={(e) => setSeed(parseInt(e.target.value))}
      />

      <button
        onClick={() => {
          seed.mutate({
            count: seedNo,
          });
        }}
        className="rounded-md bg-black p-2 text-white"
      >
        Submit
      </button>

      {seed.isLoading ? "Loading..." : seed.isError ? seed.error?.message : ""}
      {seed.isSuccess ? "Success" : ""}
      {seed.data ? JSON.stringify(seed.data) : ""}
    </div>
  );
};

export default Seed;
