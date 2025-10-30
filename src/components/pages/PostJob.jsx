import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import jobService from "@/services/api/jobService";
import employerService from "@/services/api/employerService";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [formData, setFormData] = useState({
    Name: "",
    title_c: "",
    description_c: "",
    category_c: "",
    location_c: "",
    employment_type_c: "",
    experience_level_c: "",
    salary_min_c: "",
    salary_max_c: "",
    requirements_c: "",
    benefits_c: "",
    status_c: "active",
    expires_at_c: "",
  });

  useEffect(() => {
    loadEmployerProfile();
  }, []);

  const loadEmployerProfile = async () => {
    try {
      const profile = await employerService.getCurrentProfile();
      setEmployerProfile(profile);
    } catch (error) {
      console.error("Error loading employer profile:", error);
      toast.error("Failed to load employer profile");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title_c) {
      toast.error("Job title is required");
      return;
    }
    if (!formData.description_c) {
      toast.error("Job description is required");
      return;
    }
    if (!formData.category_c) {
      toast.error("Category is required");
      return;
    }
    if (!formData.location_c) {
      toast.error("Location is required");
      return;
    }
    if (!formData.employment_type_c) {
      toast.error("Employment type is required");
      return;
    }
    if (!formData.experience_level_c) {
      toast.error("Experience level is required");
      return;
    }
    if (!employerProfile?.Id) {
      toast.error("Employer profile not found. Please create a profile first.");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        Name: formData.Name || formData.title_c,
        title_c: formData.title_c,
        description_c: formData.description_c,
        category_c: formData.category_c,
        location_c: formData.location_c,
        employment_type_c: formData.employment_type_c,
        experience_level_c: formData.experience_level_c,
        salary_min_c: formData.salary_min_c ? parseInt(formData.salary_min_c) : undefined,
        salary_max_c: formData.salary_max_c ? parseInt(formData.salary_max_c) : undefined,
        requirements_c: formData.requirements_c,
        benefits_c: formData.benefits_c,
        status_c: formData.status_c,
        posted_at_c: new Date().toISOString(),
        expires_at_c: formData.expires_at_c ? new Date(formData.expires_at_c).toISOString() : undefined,
        employer_id_c: employerProfile.Id,
      };

      await jobService.create(jobData);
      toast.success("Job posted successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(error.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ApperIcon name="ArrowLeft" size={20} />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Post a New Job</h1>
          <p className="text-slate-600">Fill in the details below to create a new job listing</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title_c" className="block text-sm font-medium text-slate-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title_c"
                name="title_c"
                type="text"
                required
                value={formData.title_c}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_c" className="block text-sm font-medium text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                id="category_c"
                name="category_c"
                required
                value={formData.category_c}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select a category</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Data Science">Data Science</option>
                <option value="Operations">Operations</option>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location_c" className="block text-sm font-medium text-slate-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                id="location_c"
                name="location_c"
                type="text"
                required
                value={formData.location_c}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full"
              />
            </div>

            {/* Employment Type */}
            <div>
              <label htmlFor="employment_type_c" className="block text-sm font-medium text-slate-700 mb-2">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <Select
                id="employment_type_c"
                name="employment_type_c"
                required
                value={formData.employment_type_c}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select employment type</option>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </Select>
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experience_level_c" className="block text-sm font-medium text-slate-700 mb-2">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <Select
                id="experience_level_c"
                name="experience_level_c"
                required
                value={formData.experience_level_c}
                onChange={handleChange}
                className="w-full"
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </Select>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min_c" className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Salary
                </label>
                <Input
                  id="salary_min_c"
                  name="salary_min_c"
                  type="number"
                  value={formData.salary_min_c}
                  onChange={handleChange}
                  placeholder="e.g. 80000"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="salary_max_c" className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Salary
                </label>
                <Input
                  id="salary_max_c"
                  name="salary_max_c"
                  type="number"
                  value={formData.salary_max_c}
                  onChange={handleChange}
                  placeholder="e.g. 120000"
                  className="w-full"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description_c" className="block text-sm font-medium text-slate-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description_c"
                name="description_c"
                required
                value={formData.description_c}
                onChange={handleChange}
                placeholder="Provide a detailed description of the role, responsibilities, and what makes this opportunity exciting..."
                rows={6}
                className="w-full"
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements_c" className="block text-sm font-medium text-slate-700 mb-2">
                Requirements
              </label>
              <Textarea
                id="requirements_c"
                name="requirements_c"
                value={formData.requirements_c}
                onChange={handleChange}
                placeholder="Enter requirements separated by commas (e.g. 5+ years experience, Bachelor's degree, JavaScript)"
                rows={3}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Separate multiple requirements with commas</p>
            </div>

            {/* Benefits */}
            <div>
              <label htmlFor="benefits_c" className="block text-sm font-medium text-slate-700 mb-2">
                Benefits
              </label>
              <Textarea
                id="benefits_c"
                name="benefits_c"
                value={formData.benefits_c}
                onChange={handleChange}
                placeholder="Enter benefits separated by commas (e.g. Health Insurance, 401k, Remote Work)"
                rows={3}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">Separate multiple benefits with commas</p>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expires_at_c" className="block text-sm font-medium text-slate-700 mb-2">
                Application Deadline
              </label>
              <Input
                id="expires_at_c"
                name="expires_at_c"
                type="date"
                value={formData.expires_at_c}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status_c" className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <Select
                id="status_c"
                name="status_c"
                value={formData.status_c}
                onChange={handleChange}
                className="w-full"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-3"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={20} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Plus" size={20} />
                    Post Job
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="text-slate-600"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;