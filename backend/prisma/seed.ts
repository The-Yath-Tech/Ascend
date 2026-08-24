/**
 * Demo seed for ASCEND (by Agora Systems) — Football Quest module.
 * One club, one coach, one team, a handful of players with Player DNA, the
 * five level badges, a sample training session with a quest, XP so the
 * leaderboard isn't empty, and an initial DIS™ snapshot per player.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const club = await prisma.club.create({
    data: { name: "Nairobi Rising Stars FC", city: "Nairobi" },
  });

  const coachUser = await prisma.user.create({
    data: {
      name: "Coach Amani",
      email: "coach@fqs.dev",
      password: await bcrypt.hash("password123", 10),
      role: "COACH",
      coach: { create: { clubId: club.id, bio: "U10 head coach" } },
    },
    include: { coach: true },
  });

  const parentUser = await prisma.user.create({
    data: {
      name: "Grace Wanjiru",
      email: "parent@fqs.dev",
      password: await bcrypt.hash("password123", 10),
      role: "PARENT",
      parent: { create: {} },
    },
    include: { parent: true },
  });

  const team = await prisma.team.create({
    data: { name: "U10 Explorers", ageGroup: "U10", clubId: club.id, coachId: coachUser.coach!.id },
  });

  const badgeTitles = [
    ["Explorer Badge", "⚽"],
    ["Warrior Badge", "🛡"],
    ["Captain Badge", "👑"],
    ["Strategist Badge", "🧠"],
    ["Legend Badge", "⭐"],
    ["Ball Wizard", "🪄"],
    ["Lightning Speed", "⚡"],
    ["Heart Award", "❤️"],
  ];
  const badges = await Promise.all(
    badgeTitles.map(([title, icon]) => prisma.badge.create({ data: { title, icon } }))
  );

  const playerNames = ["Brian Otieno", "Aisha Mwangi", "Kelvin Njoroge", "Mercy Achieng", "James Kiptoo"];
  const players = [];
  for (const name of playerNames) {
    const player = await prisma.player.create({
      data: {
        name,
        dob: new Date("2016-05-01"),
        teamId: team.id,
        parentId: name === "Brian Otieno" ? parentUser.parent!.id : undefined,
        dna: { create: {} },
      },
    });
    players.push(player);
    await prisma.playerBadge.create({ data: { playerId: player.id, badgeId: badges[0].id } });
    await prisma.xPLog.create({ data: { playerId: player.id, points: 10, reason: "Attendance", source: "system" } });
    await prisma.player.update({ where: { id: player.id }, data: { overallXP: { increment: 10 } } });
  }

  const session = await prisma.session.create({
    data: {
      teamId: team.id,
      theme: "Passing",
      durationMinutes: 90,
      coachNote:
        "Training went well. James showed leadership. Mercy struggled with passing but improved toward the end. Everyone completed the Dragon Quest.",
      quests: {
        create: [
          {
            title: "The Bridge is Broken",
            description: "Make 30 successful passes before losing 3 lives.",
            type: "PASSING",
            targetValue: 30,
            livesTotal: 3,
          },
        ],
      },
    },
  });

  await prisma.attendance.createMany({
    data: players.map((p) => ({ sessionId: session.id, playerId: p.id, present: true })),
  });

  // Seed an initial DIS™ snapshot per player (all-attended demo data, so
  // participation reads 100; other pillars start at the PlayerDNA default
  // of 50 until a coach updates assessments).
  const DIS_WEIGHTS = {
    technical: 0.2,
    tactical: 0.15,
    physical: 0.15,
    character: 0.2,
    participation: 0.15,
    learningProgression: 0.15,
  };
  for (const player of players) {
    const overall = Math.round(
      50 * DIS_WEIGHTS.technical +
        50 * DIS_WEIGHTS.tactical +
        50 * DIS_WEIGHTS.physical +
        50 * DIS_WEIGHTS.character +
        100 * DIS_WEIGHTS.participation +
        50 * DIS_WEIGHTS.learningProgression
    );
    await prisma.dISSnapshot.create({
      data: {
        playerId: player.id,
        technical: 50,
        tactical: 50,
        physical: 50,
        character: 50,
        participation: 100,
        learningProgression: 50,
        overallScore: overall,
        weightsUsed: DIS_WEIGHTS,
      },
    });
  }

  // Sample Phase 2 data for the first seeded player (Brian Otieno).
  const brian = players[0];
  await prisma.assessment.create({
    data: {
      playerId: brian.id,
      coachId: coachUser.coach!.id,
      period: "PRESEASON",
      technical: 62,
      decisionMaking: 55,
      physical: 58,
      leadership: 80,
      confidence: 65,
      creativity: 60,
      resilience: 70,
      teamwork: 85,
      discipline: 75,
      summary: "Strong leadership and teamwork; ready for more possession responsibility.",
    },
  });
  await prisma.developmentGoal.create({
    data: {
      playerId: brian.id,
      setByCoachId: coachUser.coach!.id,
      title: "Complete 50 successful weak-foot passes this month",
      description: "Targeted work on weak-foot comfort during small-sided games.",
      status: "IN_PROGRESS",
    },
  });
  await prisma.coachObservation.create({
    data: {
      playerId: brian.id,
      coachId: coachUser.coach!.id,
      note: "Took the initiative to organize the warm-up without being asked.",
      tags: ["leadership"],
    },
  });

  console.log("Seed complete.");
  console.log("Coach login: coach@fqs.dev / password123");
  console.log("Parent login: parent@fqs.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
