import KcAdminClient from "@keycloak/keycloak-admin-client";
import { GenderEnum, PrismaClient, RoleEnum } from "@repo/db";
import * as bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_BASE_URL || "http://localhost:8080",
  realmName: process.env.KEYCLOAK_REALM || "master",
});

async function main() {
  await kcAdminClient.auth({
    username: process.env.KEYCLOAK_ADMIN_USERNAME || "admin",
    password: process.env.KEYCLOAK_ADMIN_PASSWORD || "admin123",
    grantType: "password",
    clientId: "admin-cli",
  });

  const existingUsers = await kcAdminClient.users.find({
    realm: kcAdminClient.realmName,
    email: process.env.ADMIN_EMAIL,
  });

  let keycloakUserId: string = "";

  if (existingUsers.length === 0) {
    const createdUser = await kcAdminClient.users.create({
      realm: kcAdminClient.realmName,
      username: process.env.ADMIN_USERNAME,
      firstName: process.env.ADMIN_FIRST_NAME,
      lastName: process.env.ADMIN_LAST_NAME,
      email: process.env.ADMIN_EMAIL,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: process.env.ADMIN_PASSWORD ?? "admin123",
          temporary: false,
        },
      ],
    });

    keycloakUserId = createdUser.id;
  } else {
    keycloakUserId = existingUsers[0].id!;
  }

  const clients = await kcAdminClient.clients.find({
    clientId: process.env.KEYCLOAK_CLIENT_ID || "client",
  });

  const client = clients[0];

  if (client) {
    const clientRoles = await kcAdminClient.clients.listRoles({
      id: client.id!,
    });

    const adminRole = clientRoles.find((r) => r.name === "admin");

    if (adminRole) {
      await kcAdminClient.users.addClientRoleMappings({
        id: keycloakUserId,
        realm: kcAdminClient.realmName,
        clientUniqueId: client.id!,
        roles: [
          {
            id: adminRole.id!,
            name: adminRole.name!,
          },
        ],
      });
    }
  }

  const existingDbUser = await prisma.users.findUnique({
    where: {
      email: process.env.ADMIN_EMAIL ?? "",
    },
  });

  if (!existingDbUser) {
    const hashedPassword = bcryptjs.hashSync(
      process.env.ADMIN_PASSWORD ?? "",
      bcryptjs.genSaltSync(),
    );

    await prisma.users.create({
      data: {
        email: process.env.ADMIN_EMAIL ?? "",
        password: hashedPassword,
        is_email_verified: true,
        role: RoleEnum.admin,
        profile: {
          create: {
            phone_number: process.env.ADMIN_PHONE_NUMBER ?? "",
            gender: (process.env.ADMIN_GENDER as GenderEnum) ?? GenderEnum.male,
            dob: process.env.ADMIN_DOB
              ? new Date(process.env.ADMIN_DOB)
              : new Date(),
            avatar_url: process.env.ADMIN_AVATAR_URL ?? "",
            cover_photo_url: process.env.ADMIN_COVER_PHOTO_URL ?? "",
            first_name: process.env.ADMIN_FIRST_NAME ?? "",
            last_name: process.env.ADMIN_LAST_NAME ?? "",
            address: process.env.ADMIN_ADDRESS ?? "",
            username: process.env.ADMIN_USERNAME ?? "",
          },
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
