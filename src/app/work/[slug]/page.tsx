import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROJECTS, getProject } from "@/lib/projects";
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
