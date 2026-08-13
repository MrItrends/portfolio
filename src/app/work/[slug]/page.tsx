import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROJECTS, getProject } from "@/lib/projects";
import NediCaseStudy from "@/components/NediCaseStudy";
import NomNomCaseStudy from "@/components/NomNomCaseStudy";
import SpalCaseStudy from "@/components/SpalCaseStudy";
import RoboLearnCaseStudy from "@/components/RoboLearnCaseStudy";
import ReliefNowCaseStudy from "@/components/ReliefNowCaseStudy";
import MoodooCaseStudy from "@/components/MoodooCaseStudy";
import AnybuyCaseStudy from "@/components/AnybuyCaseStudy";
import SkillspaceCaseStudy from "@/components/SkillspaceCaseStudy";
import styles from "./page.module.css";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return {
    title: project ? `${project.title} — Joshua Jumbo` : "Case study",
  };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  // Fully-written case studies get their own layout; the rest show a stub.
  if (slug === "spal") return <SpalCaseStudy />;
  if (slug === "nedi") return <NediCaseStudy />;
  if (slug === "nomnom") return <NomNomCaseStudy />;
  if (slug === "robolearn") return <RoboLearnCaseStudy />;
  if (slug === "relief-now") return <ReliefNowCaseStudy />;
  if (slug === "moodoo") return <MoodooCaseStudy />;
  if (slug === "anybuy") return <AnybuyCaseStudy />;
  if (slug === "skillspace") return <SkillspaceCaseStudy />;

  return (
    <main className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>
        <p className={styles.category}>{project.category}</p>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.status}>Case study in progress.</p>
      </div>
    </main>
  );
}
