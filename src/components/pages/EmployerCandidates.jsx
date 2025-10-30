import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import applicationService from "@/services/api/applicationService";
import jobService from "@/services/api/jobService";
import jobSeekerService from "@/services/api/jobSeekerService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatusPill from "@/components/molecules/StatusPill";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

function EmployerCandidates() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [selectedJob, applications]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");

      // In production, get actual employer ID from auth context
      // For now, using mock employer ID "1"
      const jobs = await jobService.getByEmployerId("1");
      setEmployerJobs(jobs);

      if (jobs.length === 0) {
        setApplications([]);
        return;
      }

      // Get all applications for employer's jobs
      const jobIds = jobs.map((job) => job.Id);
      const allApplications = await applicationService.getAll();

      // Filter applications for employer's jobs
      const employerApplications = allApplications.filter((app) => {
        const jobId = app.job_id_c?.Id || app.job_id_c;
        return jobIds.includes(jobId);
      });

      // Enrich applications with job and candidate details
      const appsWithDetails = await Promise.all(
        employerApplications.map(async (app) => {
          const jobId = app.job_id_c?.Id || app.job_id_c;
          const job = jobs.find((j) => j.Id === jobId);
          
          const candidateId = app.candidate_id_c?.Id || app.candidate_id_c;
          let candidate = null;
          try {
            candidate = await jobSeekerService.getByUserId(candidateId);
          } catch (err) {
            console.error(`Failed to load candidate ${candidateId}:`, err);
          }

          return { ...app, job, candidate };
        })
      );

      const sorted = appsWithDetails.sort(
        (a, b) => new Date(b.applied_at_c) - new Date(a.applied_at_c)
      );

      setApplications(sorted);
    } catch (err) {
      console.error("Error loading candidates:", err);
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (selectedJob === "all") {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter((app) => {
        const jobId = app.job_id_c?.Id || app.job_id_c;
        return jobId === parseInt(selectedJob);
      });
      setFilteredApplications(filtered);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  if (employerJobs.length === 0) {
    return (
      <Empty
        icon="Briefcase"
        title="No Jobs Posted"
        description="You haven't posted any jobs yet. Post your first job to start receiving applications."
        action={
          <Button onClick={() => navigate("/employer/post-job")}>
            Post a Job
          </Button>
        }
      />
    );
  }

  if (applications.length === 0) {
    return (
      <Empty
        icon="Users"
        title="No Applications Yet"
        description="You haven't received any applications for your job postings yet."
        action={
          <Button onClick={() => navigate("/jobs")}>
            View All Jobs
          </Button>
        }
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Candidates</h1>
        <p className="text-slate-600">
          {applications.length} total{" "}
          {applications.length === 1 ? "application" : "applications"} received
        </p>
      </div>

      <div className="mb-6">
        <Select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="max-w-md"
        >
          <option value="all">All Jobs ({applications.length})</option>
          {employerJobs.map((job) => {
            const count = applications.filter((app) => {
              const jobId = app.job_id_c?.Id || app.job_id_c;
              return jobId === job.Id;
            }).length;
            return (
              <option key={job.Id} value={job.Id}>
                {job.title_c || job.Name} ({count})
              </option>
            );
          })}
        </Select>
      </div>

      {filteredApplications.length === 0 ? (
        <Empty
          icon="Filter"
          title="No Applications"
          description="No applications found for the selected job."
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.Id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {application.candidate?.full_name_c?.charAt(0) || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-1">
                          {application.candidate?.full_name_c || "Unknown Candidate"}
                        </h3>
                        <p className="text-slate-600 font-medium mb-1">
                          Applied for: {application.job?.title_c || application.job?.Name}
                        </p>
                        {application.candidate?.email_c && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <ApperIcon name="Mail" size={14} />
                            {application.candidate.email_c}
                          </p>
                        )}
                      </div>
                      <StatusPill status={application.status_c} />
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="MapPin" size={16} />
                        <span>{application.job?.location_c}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Briefcase" size={16} />
                        <span>{application.job?.employment_type_c}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Calendar" size={16} />
                        <span>
                          Applied {format(new Date(application.applied_at_c), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {application.candidate?.skills_c && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {application.candidate.skills_c.split(",").map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {application.cover_letter_c && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {application.cover_letter_c}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/jobs/${application.job_id_c?.Id || application.job_id_c}`)
                        }
                      >
                        <ApperIcon name="Briefcase" size={16} />
                        View Job
                      </Button>
                      {application.resume_url_c && (
                        <a
                          href={application.resume_url_c}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ApperIcon name="FileText" size={14} />
                          View Resume
                        </a>
                      )}
                      {application.candidate?.email_c && (
                        <a
                          href={`mailto:${application.candidate.email_c}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ApperIcon name="Mail" size={14} />
                          Contact
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployerCandidates;