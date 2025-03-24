import { unauthorized } from "next/navigation";

function UnauthorizedPage() {
  unauthorized();
}

export default UnauthorizedPage;
