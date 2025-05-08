"use client";
import GitHubIcon from "@/components/ui/icons/github";
import InstagramIcon from "@/components/ui/icons/instagram";
import TwitterIcon from "@/components/ui/icons/twitter";
import { useAppStore, useUserStore } from "@/store";
import { SocialItem, SocialType } from "@/utils";
import { Button } from "@heroui/react";
import { Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import React from "react";

const socialIconMap: Record<SocialType, React.ReactNode> = {
  instagram: <InstagramIcon width={24} height={24} />,
  github: <GitHubIcon width={24} height={24} />,
  twitter: <TwitterIcon width={24} height={24} />,
};

const getSocialLabel = (type: SocialType, username: string): string => {
  switch (type) {
    case "instagram":
      return username;
    case "github":
      return `github.com/${username}`;
    case "twitter":
      return `twitter.com/${username}`;
    default:
      return username;
  }
};

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
  const { setIsModalEditProfileOpen } = useAppStore();
  const { user } = useUserStore();

  const workPlaces =
    user?.work_places?.length !== 0
      ? user?.work_places.map((wp) => ({
          key: wp.id,
          icon: <Briefcase />,
          text: (
            <>
              <span className="font-semibold">{wp.position}</span> at{" "}
              <span className="font-semibold hover:underline hover:cursor-pointer transition-all">
                {wp.company_name}
              </span>
            </>
          ),
        }))
      : [];

  const educations =
    user?.educations?.length !== 0
      ? user?.educations.map((ed) => ({
          key: ed.id,
          icon: <GraduationCap />,
          text: (
            <>
              <span>
                Studied <span className="font-semibold">{ed.major}</span>
              </span>{" "}
              at{" "}
              <span className="font-semibold hover:underline hover:cursor-pointer transition-all">
                {ed.school_name}
              </span>
            </>
          ),
        }))
      : [];

  const socialsFromAPI: SocialItem[] =
    Array.isArray(user?.socials) && user.socials.length > 0
      ? user.socials.map((us) => ({
          key: us.id,
          type: us.social_name as SocialType,
          username: us.social_link.split("/").filter(Boolean).pop() as string,
          url: us.social_link,
        }))
      : [];

  return (
    <section className="flex flex-col md:gap-3 gap-2">
      {workPlaces?.map((item) => (
        <InfoItem key={item.key} icon={item.icon} text={item.text} />
      ))}

      {educations?.map((item) => (
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

      <Button color="primary" onPress={() => setIsModalEditProfileOpen(true)}>
        Edit details
      </Button>
    </section>
  );
};

export default SocialsIntro;
