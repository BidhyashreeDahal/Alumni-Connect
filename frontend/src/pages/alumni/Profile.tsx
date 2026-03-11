import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./profile.css";

type UserRole = "student" | "alumni";

type ProfileForm = {
    firstName: string;
    lastName: string;
    schoolEmail: string;
    personalEmail: string;
    phone: string;
    location: string;
    bio: string;

    program: string;
    graduationYear: string;

    // Shared career fields
    skills: string;
    linkedInUrl: string;
    portfolioUrl: string;
    resumeUrl: string;

    // Student fields
    careerInterests: string;
    preferredIndustries: string;
    preferredRoles: string;
    lookingForMentor: boolean;
    mentorshipAreas: string;
    preferredContactMethod: string;
    notifyAnnouncements: boolean;
    notifyEvents: boolean;
    notifyMentorship: boolean;

    // Alumni fields
    jobTitle: string;
    company: string;
    industry: string;
    employmentStatus: string;
    certifications: string;
    availableForMentoring: boolean;
    visibilityLevel: "faculty-only" | "students-visible";
    showContactInfo: boolean;
};

const Profile: React.FC = () => {
    const { user } = useAuth();
    const role = (user?.role || "student") as UserRole;

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // This is the data shown in the form
    const [form, setForm] = useState<ProfileForm>({
        firstName: "",
        lastName: "",
        schoolEmail: "",
        personalEmail: "",
        phone: "",
        location: "",
        bio: "",

        program: "",
        graduationYear: "",

        skills: "",
        linkedInUrl: "",
        portfolioUrl: "",
        resumeUrl: "",

        careerInterests: "",
        preferredIndustries: "",
        preferredRoles: "",
        lookingForMentor: false,
        mentorshipAreas: "",
        preferredContactMethod: "",

        notifyAnnouncements: true,
        notifyEvents: true,
        notifyMentorship: true,

        jobTitle: "",
        company: "",
        industry: "",
        employmentStatus: "",
        certifications: "",
        availableForMentoring: false,
        visibilityLevel: "students-visible",
        showContactInfo: false,
    });

    const [originalForm, setOriginalForm] = useState<ProfileForm>(form);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // TODO: Replace with backend call later
                // Example:
                // const data = await profileAPI.getMyProfile();

                const mockData: ProfileForm =
                    role === "student"
                        ? {
                            firstName: "Subhana",
                            lastName: "Hashimi",
                            schoolEmail: user?.email || "",
                            personalEmail: "",
                            phone: "",
                            location: "Oshawa, ON",
                            bio: "Computer Programming student interested in web development and mentorship opportunities.",

                            program: "Computer Programming and Analysis",
                            graduationYear: "2026",

                            skills: "React, TypeScript, Node.js, SQL",
                            linkedInUrl: "",
                            portfolioUrl: "",
                            resumeUrl: "",

                            careerInterests: "Frontend Development, Full-Stack Development, UI/UX",
                            preferredIndustries: "Technology, Education",
                            preferredRoles: "Frontend Developer, Web Developer",
                            lookingForMentor: true,
                            mentorshipAreas: "Career guidance, resume feedback, web development",
                            preferredContactMethod: "Email",

                            notifyAnnouncements: true,
                            notifyEvents: true,
                            notifyMentorship: true,

                            jobTitle: "",
                            company: "",
                            industry: "",
                            employmentStatus: "",
                            certifications: "",
                            availableForMentoring: false,
                            visibilityLevel: "students-visible",
                            showContactInfo: false,
                        }
                        : {
                            firstName: "Alex",
                            lastName: "Johnson",
                            schoolEmail: "",
                            personalEmail: user?.email || "",
                            phone: "",
                            location: "Toronto, ON",
                            bio: "Alumni working in software development and open to supporting students through mentorship.",

                            program: "Computer Programming and Analysis",
                            graduationYear: "2022",

                            skills: "React, Node.js, SQL, REST APIs",
                            linkedInUrl: "",
                            portfolioUrl: "",
                            resumeUrl: "",

                            careerInterests: "",
                            preferredIndustries: "",
                            preferredRoles: "",
                            lookingForMentor: false,
                            mentorshipAreas: "",
                            preferredContactMethod: "",

                            notifyAnnouncements: true,
                            notifyEvents: true,
                            notifyMentorship: true,

                            jobTitle: "Software Developer",
                            company: "Tech Company",
                            industry: "Technology",
                            employmentStatus: "Full-Time",
                            certifications: "AWS Cloud Practitioner",
                            availableForMentoring: true,
                            visibilityLevel: "students-visible",
                            showContactInfo: true,
                        };

                setForm(mockData);
                setOriginalForm(mockData);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [role, user?.email]);

    const profileCompletion = useMemo(() => {
        const fieldsToCheck =
            role === "student"
                ? [
                    form.firstName,
                    form.lastName,
                    form.schoolEmail,
                    form.program,
                    form.graduationYear,
                    form.skills,
                    form.careerInterests,
                    form.preferredRoles,
                    form.mentorshipAreas,
                ]
                : [
                    form.firstName,
                    form.lastName,
                    form.personalEmail,
                    form.program,
                    form.graduationYear,
                    form.jobTitle,
                    form.company,
                    form.skills,
                    form.industry,
                ];

        const completed = fieldsToCheck.filter((value) => String(value).trim() !== "").length;
        return Math.round((completed / fieldsToCheck.length) * 100);
    }, [form, role]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({ ...prev, [name]: checked }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setForm(originalForm);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // TODO: Replace with your backend call later
            // Example:
            // await profileAPI.updateMyProfile(form);

            console.log("Saving profile:", form);

            setOriginalForm(form);
            setIsEditing(false);
            alert("Profile updated successfully.");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card profile-skeleton">
                    <div className="profile-skel-line profile-w-40"></div>
                    <div className="profile-skel-line profile-w-20"></div>
                    <div className="profile-skel-line profile-w-60"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-header-card">
                <div className="profile-header-left">
                    <div className="profile-avatar">
                        {form.firstName?.charAt(0)}
                        {form.lastName?.charAt(0)}
                    </div>

                    <div>
                        <h1 className="profile-title">
                            {form.firstName} {form.lastName}
                        </h1>
                        <p className="profile-subtitle">
                            {role === "student" ? "Student Profile" : "Alumni Profile"}
                        </p>
                        <p className="profile-small">
                            {form.program} • Class of {form.graduationYear}
                        </p>
                    </div>
                </div>

                <div className="profile-header-right">
                    <div className="profile-completion">
                        <span>Profile Completion</span>
                        <strong>{profileCompletion}%</strong>
                    </div>

                    <div className="profile-progress">
                        <div
                            className="profile-progress-bar"
                            style={{ width: `${profileCompletion}%` }}
                        ></div>
                    </div>

                    {!isEditing ? (
                        <button className="profile-btn profile-btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    ) : (
                        <div className="profile-btn-group">
                            <button className="profile-btn profile-btn-secondary" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="profile-btn profile-btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-grid">
                <Section title="Personal Information">
                    <div className="profile-form-grid">
                        <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} disabled={!isEditing} />
                        <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} disabled={!isEditing} />
                        <Input
                            label="School Email"
                            name="schoolEmail"
                            value={form.schoolEmail}
                            onChange={handleChange}
                            disabled={!isEditing || role === "alumni"}
                        />
                        <Input
                            label="Personal Email"
                            name="personalEmail"
                            value={form.personalEmail}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} disabled={!isEditing} />
                        <Input label="Location" name="location" value={form.location} onChange={handleChange} disabled={!isEditing} />
                    </div>

                    <TextArea
                        label="Bio / About"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Section>

                <Section title="Academic Information">
                    <div className="profile-form-grid">
                        <Input label="Program" name="program" value={form.program} onChange={handleChange} disabled />
                        <Input
                            label="Graduation Year"
                            name="graduationYear"
                            value={form.graduationYear}
                            onChange={handleChange}
                            disabled
                        />
                    </div>
                    <p className="profile-note">
                        Academic fields are read-only on self-service profile pages.
                    </p>
                </Section>

                {role === "student" && (
                    <>
                        <Section title="Career Profile">
                            <div className="profile-form-grid">
                                <TextArea
                                    label="Career Interests"
                                    name="careerInterests"
                                    value={form.careerInterests}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <TextArea
                                    label="Skills"
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Preferred Industries"
                                    name="preferredIndustries"
                                    value={form.preferredIndustries}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Preferred Roles"
                                    name="preferredRoles"
                                    value={form.preferredRoles}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="LinkedIn URL"
                                    name="linkedInUrl"
                                    value={form.linkedInUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Portfolio URL"
                                    name="portfolioUrl"
                                    value={form.portfolioUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Resume URL / File Link"
                                    name="resumeUrl"
                                    value={form.resumeUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </Section>

                        <Section title="Mentorship Preferences">
                            <div className="profile-form-grid">
                                <Checkbox
                                    label="Looking for a Mentor"
                                    name="lookingForMentor"
                                    checked={form.lookingForMentor}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Preferred Contact Method"
                                    name="preferredContactMethod"
                                    value={form.preferredContactMethod}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <TextArea
                                label="Mentorship Areas"
                                name="mentorshipAreas"
                                value={form.mentorshipAreas}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Section>

                        <Section title="Notification Preferences">
                            <div className="profile-checkbox-list">
                                <Checkbox
                                    label="Announcements"
                                    name="notifyAnnouncements"
                                    checked={form.notifyAnnouncements}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Checkbox
                                    label="Event Invitations"
                                    name="notifyEvents"
                                    checked={form.notifyEvents}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Checkbox
                                    label="Mentorship Updates"
                                    name="notifyMentorship"
                                    checked={form.notifyMentorship}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </Section>
                    </>
                )}

                {role === "alumni" && (
                    <>
                        <Section title="Professional Information">
                            <div className="profile-form-grid">
                                <Input label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} disabled={!isEditing} />
                                <Input label="Company" name="company" value={form.company} onChange={handleChange} disabled={!isEditing} />
                                <Input label="Industry" name="industry" value={form.industry} onChange={handleChange} disabled={!isEditing} />
                                <Input
                                    label="Employment Status"
                                    name="employmentStatus"
                                    value={form.employmentStatus}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <TextArea label="Skills" name="skills" value={form.skills} onChange={handleChange} disabled={!isEditing} />
                                <Input
                                    label="Certifications"
                                    name="certifications"
                                    value={form.certifications}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="LinkedIn URL"
                                    name="linkedInUrl"
                                    value={form.linkedInUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Portfolio URL"
                                    name="portfolioUrl"
                                    value={form.portfolioUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Resume URL / File Link"
                                    name="resumeUrl"
                                    value={form.resumeUrl}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </Section>

                        <Section title="Visibility & Mentorship">
                            <div className="profile-form-grid">
                                <Checkbox
                                    label="Available for Mentoring"
                                    name="availableForMentoring"
                                    checked={form.availableForMentoring}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />

                                <Checkbox
                                    label="Show Contact Information"
                                    name="showContactInfo"
                                    checked={form.showContactInfo}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />

                                <Select
                                    label="Profile Visibility"
                                    name="visibilityLevel"
                                    value={form.visibilityLevel}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    options={[
                                        { value: "faculty-only", label: "Faculty Only" },
                                        { value: "students-visible", label: "Visible to Students" },
                                    ]}
                                />
                            </div>
                        </Section>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;

/* ---------- Small Reusable Components ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="profile-card">
            <h2 className="profile-section-title">{title}</h2>
            {children}
        </div>
    );
}

function Input({
                   label,
                   name,
                   value,
                   onChange,
                   disabled = false,
               }: {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    disabled?: boolean;
}) {
    return (
        <label className="profile-field">
            <span>{label}</span>
            <input
                className="profile-input"
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        </label>
    );
}

function TextArea({
                      label,
                      name,
                      value,
                      onChange,
                      disabled = false,
                  }: {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    disabled?: boolean;
}) {
    return (
        <label className="profile-field profile-field-full">
            <span>{label}</span>
            <textarea
                className="profile-textarea"
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                rows={4}
            />
        </label>
    );
}

function Checkbox({
                      label,
                      name,
                      checked,
                      onChange,
                      disabled = false,
                  }: {
    label: string;
    name: string;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    disabled?: boolean;
}) {
    return (
        <label className="profile-checkbox">
            <input type="checkbox" name={name} checked={checked} onChange={onChange} disabled={disabled} />
            <span>{label}</span>
        </label>
    );
}

function Select({
                    label,
                    name,
                    value,
                    onChange,
                    disabled = false,
                    options,
                }: {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    disabled?: boolean;
    options: { value: string; label: string }[];
}) {
    return (
        <label className="profile-field">
            <span>{label}</span>
            <select className="profile-input" name={name} value={value} onChange={onChange} disabled={disabled}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}