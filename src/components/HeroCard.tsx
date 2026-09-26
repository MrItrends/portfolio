import Link from "next/link";
import Image from "next/image";
import styles from "./Hero.module.css";

/**
 * A small project card in the hero collage. On hover a popup fades in over the
 * card (it does not expand) showing the project name and a "View case study"
 * link; moving off the card closes it. CSS-only hover — no JS needed.
 */
export default function HeroCard({
  slug,
  title,
  image,
  className,
}: {
  slug: string;
  title: string;
  image: string;
  className: string;
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardMedia}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className={styles.cardImg}
        />
      </div>
      <div className={styles.cardPopup}>
        <span className={styles.cardName}>{title}</span>
        <Link href={`/work/${slug}`} className={styles.viewBtn}>
          View case study
        </Link>
      </div>
    </div>
  );
}
