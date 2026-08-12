import { Link } from "react-router-dom";

export function Community() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Community</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Link to="/community/projects" className="block p-4 rounded-border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 transition-colors">
            <h3 className="font-medium text-evolw-black dark:text-white">Projects</h3>
            <p>Browse and manage community projects</p>
          </Link>
        </div>
        <div>
          <Link to="/community/hackathons" className="block p-4 rounded-border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 transition-colors">
            <h3 className="font-medium text-evolw-black dark:text-white">Hackathons</h3>
            <p>Find and register for hackathons</p>
          </Link>
        </div>
        <div>
          <Link to="/community/events" className="block p-4 rounded-border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 transition-colors">
            <h3 className="font-medium text-evolw-black dark:text-white">Events</h3>
            <p>Upcoming workshops and AMA sessions</p>
          </Link>
        </div>
      </div>
      <div className="mt-6">
        <Link to="/community/open-source" className="block p-4 rounded-border border-evolw-gray-200 dark:border-white/10 hover:border-evolw-accent/30 transition-colors">
          <h3 className="font-medium text-evolw-black dark:text-white">Open Source</h3>
          <p>GitHub repositories and good first issues</p>
        </Link>
      </div>
    </div>
  );
}