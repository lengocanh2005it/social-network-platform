"use client";
import GlobalIcon from "@/components/ui/icons/global-icon";
import Instagram from "@/components/ui/icons/instagram";
import XIcon from "@/components/ui/icons/x";
import { SocialItem, SocialType } from "@/utils";
import { Button } from "@heroui/react";
import { Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import React from "react";

const socialsFromAPI: SocialItem[] = [
  {
    key: 1,
    type: "instagram",
    username: "ngoc_anhh08hi",
    url: "https://instagram.com/ngoc_anhh08hi",
  },
  {
    key: 2,
    type: "github",
    username: "lengocanh2005it",
    url: "https://github.com/lengocanh2005it",
  },
  {
    key: 3,
    type: "x",
    username: "ngocanh2005",
    url: "https://x.com/ngocanh2005",
  },
];

const socialIconMap: Record<SocialType, React.ReactNode> = {
  instagram: <Instagram />,
  github: <GlobalIcon />,
  x: <XIcon />,
};

const getSocialLabel = (type: SocialType, username: string): string => {
  switch (type) {
    case "instagram":
      return username;
    case "github":
      return `github.com/${username}`;
    case "x":
      return `x.com/${username}`;
    default:
      return username;
  }
};

const workPlaces = [
  {
    key: "id-12222",
    icon: <Briefcase />,
    text: (
      <>
        <span className="font-medium">Fullstack Developer</span> at{" "}
        <span className="font-semibold hover:underline hover:cursor-pointer transition-all">
          WebDev Studios
        </span>
      </>
    ),
  },
  {
    key: "id-231243432423",
    icon: <Briefcase />,
    text: (
      <>
        <span className="font-medium">Backend Developer Intern</span> at{" "}
        <span className="font-semibold hover:underline hover:cursor-pointer transition-all">
          FPT Software
        </span>
      </>
    ),
  },
];

const educations = [
  {
    key: "id-3",
    icon: <GraduationCap />,
    text: (
      <>
        <span className="font-medium">Studied Software Engineering (SE)</span>{" "}
        at{" "}
        <span className="font-semibold hover:underline hover:cursor-pointer transition-all">
          University Of Information Technology (UIT)
        </span>
      </>
    ),
  },
];

const InfoItem = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex-shrink-0">{icon}</div>
    <p className="text-sm leading-snug font-normal">{text}</p>
  </div>
);

const SocialLink = ({
  icon,
  link,
  label,
}: {
  icon: React.ReactNode;
  link: string;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex-shrink-0">{icon}</div>
    <Link
      href={link}
      className="text-sm leading-snug hover:text-blue-600 hover:underline font-normal"
    >
      {label}
    </Link>
  </div>
);

const SocialsIntro = () => {
  return (
    <section className="flex flex-col md:gap-3 gap-2">
      {workPlaces.map((item) => (
        <InfoItem key={item.key} icon={item.icon} text={item.text} />
      ))}

      {educations.map((item) => (
        <InfoItem key={item.key} icon={item.icon} text={item.text} />
      ))}

      {socialsFromAPI.map((item) => (
        <SocialLink
          key={item.key}
          icon={socialIconMap[item.type]}
          link={item.url}
          label={getSocialLabel(item.type, item.username)}
        />
      ))}

      <Button color="primary">Edit details</Button>
    </section>
  );
};

export default SocialsIntro;
