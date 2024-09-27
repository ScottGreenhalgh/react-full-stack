import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h2>404: Page Not Found</h2>
      <Link to="/">
        <h3>Go Home</h3>
      </Link>
    </div>
  );
}
