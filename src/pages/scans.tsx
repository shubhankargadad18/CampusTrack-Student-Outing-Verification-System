import { api } from "../utils/api";
import { useEffect } from "react";

const PrevScans: React.FC = () => {
  const scansQuery = api.outing.getScans.useQuery({});

  useEffect(() => {
    console.log(scansQuery.data);
  }, [scansQuery]);
  return <></>;
};

export default PrevScans;
