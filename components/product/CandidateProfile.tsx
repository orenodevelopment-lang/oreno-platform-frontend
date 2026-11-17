"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { asArray, asRecord } from "@/lib/api/client";
import { ProductPage } from "./ProductUI";
import { label, value, ResourceState, useResource } from "./LiveWorkspace";

export function CandidateProfile({ id }: { id: string }) {
  const resource = useResource("candidate", `/${encodeURIComponent(id)}`);
  const profile = asRecord(resource.data.profile);
  const search = useSearchParams();
  const applicationId = search.get("applicationId");
  const shortlistId = search.get("shortlistId");
  const back = applicationId ? `/company/applications/${encodeURIComponent(applicationId)}`
    : shortlistId ? `/company/shortlists/${encodeURIComponent(shortlistId)}` : "/company/applications";
  const sections = [
    { key: "experiences", title: "Experience", heading: "title", detail: "company" },
    { key: "education", title: "Education", heading: "institution", detail: "degree" },
    { key: "certifications", title: "Certifications", heading: "name", detail: "issuer" },
    { key: "portfolioItems", title: "Portfolio", heading: "title", detail: "category" },
  ];
  return (
    <ProductPage title={resource.loaded ? label(profile) : "Candidate profile"}
      actions={<Link className="product-button-secondary" href={back}>Back to {shortlistId && !applicationId ? "shortlist" : "applications"}</Link>}>
      <ResourceState resource={resource}>
        <header className="public-profile-hero">
          <Image src={value(profile, "avatarUrl") || "/assets/figma/oreno-mark.svg"} alt="" width={180} height={180} />
          <div>
            <h3>{value(profile, "headline")}</h3>
            <p>{[value(profile, "city"), value(profile, "countryCode")].filter(Boolean).join(", ")}</p>
            <p>{value(profile, "yearsExperience")} years of experience</p>
            <ul>{asArray(profile.skills).map(asRecord).map(skill => <li key={value(skill, "skill.id")}>{value(skill, "skill.name")}</li>)}</ul>
          </div>
        </header>
        <section className="candidate-profile-section"><h3>About</h3><p>{value(profile, "bio") || "No biography provided."}</p></section>
        {sections.map(section => {
          const records = asArray(profile[section.key]).map(asRecord);
          return records.length > 0 && <section className="candidate-profile-section" key={section.key}>
            <h3>{section.title}</h3>
            {records.map(record => <article key={value(record, "id")}>
              <h4>{value(record, section.heading)}</h4><p>{value(record, section.detail)}</p>
              <p>{value(record, "description")}</p>
              {/^https?:\/\//.test(value(record, "url")) && <a href={value(record, "url")} target="_blank" rel="noreferrer">View project</a>}
            </article>)}
          </section>;
        })}
      </ResourceState>
    </ProductPage>
  );
}
