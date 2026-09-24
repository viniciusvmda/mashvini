import { useQuery } from "@tanstack/react-query";

function HealthStatus() {
  const { isSuccess, isError } = useQuery({ queryKey: ["health"] });

  if (isSuccess) {
    return <p>Healthy</p>;
  }

  if (isError) {
    return <p>Unhealthy</p>;
  }

  return <p>Loading</p>;
}

export { HealthStatus };
