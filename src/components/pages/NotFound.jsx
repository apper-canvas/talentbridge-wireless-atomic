import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <ApperIcon
            name="FileQuestion"
            className="w-20 h-20 mx-auto text-primary"
          />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary mb-4">
          Page Not Found
        </h2>
        <p className="text-secondary mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-accent transition-colors"
        >
          <ApperIcon name="Home" size={20} />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;