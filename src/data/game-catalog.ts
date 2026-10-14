// 생성 파일: scripts/generate-game-data.py 가 Assets/PublicContentCatalog.json(v08.09.00.2521387)에서 만든다. 직접 수정하지 말 것.
import type { AgentRole } from "@/lib/assets";

export type CatalogAbility = { id: string; slot: string; key: "Q" | "E" | "C" | "X"; ko: string; en: string };
export type CatalogAgent = { key: string; uuid: string; ko: string; en: string; role: AgentRole; abilities: CatalogAbility[] };
export type CatalogMap = {
  key: string;
  uuid: string;
  ko: string;
  en: string;
  minimap: { xMultiplier: number; yMultiplier: number; xScalarToAdd: number; yScalarToAdd: number };
};
export type CatalogWeapon = {
  key: string;
  uuid: string;
  ko: string;
  en: string;
  category: string;
  fireRate: number;
  magazine: number;
  headDamage: number;
  bodyDamage: number;
  legDamage: number;
};
export type CatalogRole = { key: AgentRole; uuid: string; ko: string; en: string };

export const CATALOG_VERSION = "08.09.00.2521387";

export const CATALOG_AGENTS: CatalogAgent[] = [
  {
    "key": "astra",
    "uuid": "41FB69C1-4189-7B37-F117-BCAF1E96F1BF",
    "ko": "아스트라",
    "en": "Astra",
    "role": "controller",
    "abilities": [
      {
        "id": "astra-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "신성 파동",
        "en": "Nova Pulse"
      },
      {
        "id": "astra-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "성운 / 소멸",
        "en": "Nebula / Dissipate"
      },
      {
        "id": "astra-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "중력의 샘",
        "en": "Gravity Well"
      },
      {
        "id": "astra-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "천상계 형상 / 우주 장벽",
        "en": "Astral Form / Cosmic Divide"
      }
    ]
  },
  {
    "key": "breach",
    "uuid": "5F8D3A7F-467B-97F3-062C-13ACF203C006",
    "ko": "브리치",
    "en": "Breach",
    "role": "initiator",
    "abilities": [
      {
        "id": "breach-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "섬광 폭발",
        "en": "Flashpoint"
      },
      {
        "id": "breach-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "균열",
        "en": "Fault Line"
      },
      {
        "id": "breach-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "여진",
        "en": "Aftershock"
      },
      {
        "id": "breach-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "지진 강타",
        "en": "Rolling Thunder"
      }
    ]
  },
  {
    "key": "brimstone",
    "uuid": "9F0D8BA9-4140-B941-57D3-A7AD57C6B417",
    "ko": "브림스톤",
    "en": "Brimstone",
    "role": "controller",
    "abilities": [
      {
        "id": "brimstone-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "소이탄",
        "en": "Incendiary"
      },
      {
        "id": "brimstone-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "공중 연막",
        "en": "Sky Smoke"
      },
      {
        "id": "brimstone-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "자극제 신호기",
        "en": "Stim Beacon"
      },
      {
        "id": "brimstone-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "궤도 일격",
        "en": "Orbital Strike"
      }
    ]
  },
  {
    "key": "chamber",
    "uuid": "22697A3D-45BF-8DD7-4FEC-84A9E28C69D7",
    "ko": "체임버",
    "en": "Chamber",
    "role": "sentinel",
    "abilities": [
      {
        "id": "chamber-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "헤드헌터",
        "en": "Headhunter"
      },
      {
        "id": "chamber-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "랑데부",
        "en": "Rendezvous"
      },
      {
        "id": "chamber-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "트레이드마크",
        "en": "Trademark"
      },
      {
        "id": "chamber-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "역작",
        "en": "Tour De Force"
      }
    ]
  },
  {
    "key": "clove",
    "uuid": "1DBF2EDD-4729-0984-3115-DAA5EED44993",
    "ko": "클로브",
    "en": "Clove",
    "role": "controller",
    "abilities": [
      {
        "id": "clove-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "간섭",
        "en": "Meddle"
      },
      {
        "id": "clove-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "계략",
        "en": "Ruse"
      },
      {
        "id": "clove-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "활력 회복",
        "en": "Pick-me-up"
      },
      {
        "id": "clove-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "아직 안 죽었어",
        "en": "Not Dead Yet"
      }
    ]
  },
  {
    "key": "cypher",
    "uuid": "117ED9E3-49F3-6512-3CCF-0CADA7E3823B",
    "ko": "사이퍼",
    "en": "Cypher",
    "role": "sentinel",
    "abilities": [
      {
        "id": "cypher-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "사이버 감옥",
        "en": "Cyber Cage"
      },
      {
        "id": "cypher-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "스파이캠",
        "en": "Spycam"
      },
      {
        "id": "cypher-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "함정",
        "en": "Trapwire"
      },
      {
        "id": "cypher-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "신경 절도",
        "en": "Neural Theft"
      }
    ]
  },
  {
    "key": "deadlock",
    "uuid": "CC8B64C8-4B25-4FF9-6E7F-37B4DA43D235",
    "ko": "데드록",
    "en": "Deadlock",
    "role": "sentinel",
    "abilities": [
      {
        "id": "deadlock-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "음향 센서",
        "en": "Sonic Sensor"
      },
      {
        "id": "deadlock-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "장벽망",
        "en": "Barrier Mesh"
      },
      {
        "id": "deadlock-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "중력그물",
        "en": "GravNet"
      },
      {
        "id": "deadlock-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "소멸",
        "en": "Annihilation"
      }
    ]
  },
  {
    "key": "fade",
    "uuid": "DADE69B4-4F5A-8528-247B-219E5A1FACD6",
    "ko": "페이드",
    "en": "Fade",
    "role": "initiator",
    "abilities": [
      {
        "id": "fade-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "포박",
        "en": "Seize"
      },
      {
        "id": "fade-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "귀체",
        "en": "Haunt"
      },
      {
        "id": "fade-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "추적귀",
        "en": "Prowler"
      },
      {
        "id": "fade-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "황혼",
        "en": "Nightfall"
      }
    ]
  },
  {
    "key": "gekko",
    "uuid": "E370FA57-4757-3604-3648-499E1F642D3F",
    "ko": "게코",
    "en": "Gekko",
    "role": "initiator",
    "abilities": [
      {
        "id": "gekko-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "지원봇",
        "en": "Wingman"
      },
      {
        "id": "gekko-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "기절봇",
        "en": "Dizzy"
      },
      {
        "id": "gekko-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "폭파봇 지옥",
        "en": "Mosh Pit"
      },
      {
        "id": "gekko-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "요동봇",
        "en": "Thrash"
      }
    ]
  },
  {
    "key": "harbor",
    "uuid": "95B78ED7-4637-86D9-7E41-71BA8C293152",
    "ko": "하버",
    "en": "Harbor",
    "role": "controller",
    "abilities": [
      {
        "id": "harbor-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "해만",
        "en": "Cove"
      },
      {
        "id": "harbor-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "만조",
        "en": "High Tide"
      },
      {
        "id": "harbor-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "폭포",
        "en": "Cascade"
      },
      {
        "id": "harbor-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "심판",
        "en": "Reckoning"
      }
    ]
  },
  {
    "key": "iso",
    "uuid": "0E38B510-41A8-5780-5E8F-568B2A4F2D6C",
    "ko": "아이소",
    "en": "Iso",
    "role": "duelist",
    "abilities": [
      {
        "id": "iso-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "약화",
        "en": "Undercut"
      },
      {
        "id": "iso-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "구슬 보호막",
        "en": "Double Tap"
      },
      {
        "id": "iso-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "대비책",
        "en": "Contingency"
      },
      {
        "id": "iso-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "청부 계약",
        "en": "Kill Contract"
      }
    ]
  },
  {
    "key": "jett",
    "uuid": "ADD6443A-41BD-E414-F6AD-E58D267F4E95",
    "ko": "제트",
    "en": "Jett",
    "role": "duelist",
    "abilities": [
      {
        "id": "jett-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "상승 기류",
        "en": "Updraft"
      },
      {
        "id": "jett-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "순풍",
        "en": "Tailwind"
      },
      {
        "id": "jett-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "연막 폭발",
        "en": "Cloudburst"
      },
      {
        "id": "jett-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "칼날 폭풍",
        "en": "Blade Storm"
      }
    ]
  },
  {
    "key": "kayo",
    "uuid": "601DBBE7-43CE-BE57-2A40-4ABD24953621",
    "ko": "케이/오",
    "en": "KAY/O",
    "role": "initiator",
    "abilities": [
      {
        "id": "kayo-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "플래시/드라이브",
        "en": "FLASH/drive"
      },
      {
        "id": "kayo-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "제로/포인트",
        "en": "ZERO/point"
      },
      {
        "id": "kayo-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "파편/탄",
        "en": "FRAG/ment"
      },
      {
        "id": "kayo-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "무력화/명령",
        "en": "NULL/cmd"
      }
    ]
  },
  {
    "key": "killjoy",
    "uuid": "1E58DE9C-4950-5125-93E9-A0AEE9F98746",
    "ko": "킬조이",
    "en": "Killjoy",
    "role": "sentinel",
    "abilities": [
      {
        "id": "killjoy-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "알람봇",
        "en": "ALARMBOT"
      },
      {
        "id": "killjoy-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "포탑",
        "en": "TURRET"
      },
      {
        "id": "killjoy-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "나노스웜",
        "en": "Nanoswarm"
      },
      {
        "id": "killjoy-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "봉쇄",
        "en": "Lockdown"
      }
    ]
  },
  {
    "key": "neon",
    "uuid": "BB2A4828-46EB-8CD1-E765-15848195D751",
    "ko": "네온",
    "en": "Neon",
    "role": "duelist",
    "abilities": [
      {
        "id": "neon-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "릴레이 볼트",
        "en": "Relay Bolt"
      },
      {
        "id": "neon-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "고속 기어",
        "en": "High Gear"
      },
      {
        "id": "neon-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "추월 차선",
        "en": "Fast Lane"
      },
      {
        "id": "neon-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "오버드라이브",
        "en": "Overdrive"
      }
    ]
  },
  {
    "key": "omen",
    "uuid": "8E253930-4C05-31DD-1B6C-968525494517",
    "ko": "오멘",
    "en": "Omen",
    "role": "controller",
    "abilities": [
      {
        "id": "omen-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "피해망상",
        "en": "Paranoia"
      },
      {
        "id": "omen-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "어둠의 장막",
        "en": "Dark Cover"
      },
      {
        "id": "omen-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "어둠의 발자국",
        "en": "Shrouded Step"
      },
      {
        "id": "omen-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "그림자 습격",
        "en": "From the Shadows"
      }
    ]
  },
  {
    "key": "phoenix",
    "uuid": "EB93336A-449B-9C1B-0A54-A891F7921D69",
    "ko": "피닉스",
    "en": "Phoenix",
    "role": "duelist",
    "abilities": [
      {
        "id": "phoenix-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "커브볼",
        "en": "Curveball"
      },
      {
        "id": "phoenix-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "뜨거운 손",
        "en": "Hot Hands"
      },
      {
        "id": "phoenix-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "불길",
        "en": "Blaze"
      },
      {
        "id": "phoenix-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "역습",
        "en": "Run it Back"
      }
    ]
  },
  {
    "key": "raze",
    "uuid": "F94C3B30-42BE-E959-889C-5AA313DBA261",
    "ko": "레이즈",
    "en": "Raze",
    "role": "duelist",
    "abilities": [
      {
        "id": "raze-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "폭발 팩",
        "en": "Blast Pack"
      },
      {
        "id": "raze-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "페인트탄",
        "en": "Paint Shells"
      },
      {
        "id": "raze-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "폭발 봇",
        "en": "Boom Bot"
      },
      {
        "id": "raze-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "대미 장식",
        "en": "Showstopper"
      }
    ]
  },
  {
    "key": "reyna",
    "uuid": "A3BFB853-43B2-7238-A4F1-AD90E9E46BCC",
    "ko": "레이나",
    "en": "Reyna",
    "role": "duelist",
    "abilities": [
      {
        "id": "reyna-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "포식",
        "en": "Devour"
      },
      {
        "id": "reyna-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "무시",
        "en": "Dismiss"
      },
      {
        "id": "reyna-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "눈총",
        "en": "Leer"
      },
      {
        "id": "reyna-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "여제",
        "en": "Empress"
      }
    ]
  },
  {
    "key": "sage",
    "uuid": "569FDD95-4D10-43AB-CA70-79BECC718B46",
    "ko": "세이지",
    "en": "Sage",
    "role": "sentinel",
    "abilities": [
      {
        "id": "sage-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "둔화 구슬",
        "en": "Slow Orb"
      },
      {
        "id": "sage-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "회복 구슬",
        "en": "Healing Orb"
      },
      {
        "id": "sage-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "장벽 구슬",
        "en": "Barrier Orb"
      },
      {
        "id": "sage-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "부활",
        "en": "Resurrection"
      }
    ]
  },
  {
    "key": "skye",
    "uuid": "6F2A04CA-43E0-BE17-7F36-B3908627744D",
    "ko": "스카이",
    "en": "Skye",
    "role": "initiator",
    "abilities": [
      {
        "id": "skye-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "정찰자",
        "en": "Trailblazer"
      },
      {
        "id": "skye-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "인도하는 빛",
        "en": "Guiding Light"
      },
      {
        "id": "skye-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "재생",
        "en": "Regrowth"
      },
      {
        "id": "skye-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "추적자",
        "en": "Seekers"
      }
    ]
  },
  {
    "key": "sova",
    "uuid": "320B2A48-4D9B-A075-30F1-1F93A9B638FA",
    "ko": "소바",
    "en": "Sova",
    "role": "initiator",
    "abilities": [
      {
        "id": "sova-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "충격 화살",
        "en": "Shock Bolt"
      },
      {
        "id": "sova-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "정찰용 화살",
        "en": "Recon Bolt"
      },
      {
        "id": "sova-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "올빼미 드론",
        "en": "Owl Drone"
      },
      {
        "id": "sova-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "사냥꾼의 분노",
        "en": "Hunter's Fury"
      }
    ]
  },
  {
    "key": "viper",
    "uuid": "707EAB51-4836-F488-046A-CDA6BF494859",
    "ko": "바이퍼",
    "en": "Viper",
    "role": "controller",
    "abilities": [
      {
        "id": "viper-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "독성 연기",
        "en": "Poison Cloud"
      },
      {
        "id": "viper-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "독성 장막",
        "en": "Toxic Screen"
      },
      {
        "id": "viper-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "뱀 이빨",
        "en": "Snake Bite"
      },
      {
        "id": "viper-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "독사의 구덩이",
        "en": "Viper's Pit"
      }
    ]
  },
  {
    "key": "yoru",
    "uuid": "7F94D92C-4234-0A36-9646-3A87EB8B5C89",
    "ko": "요루",
    "en": "Yoru",
    "role": "duelist",
    "abilities": [
      {
        "id": "yoru-q",
        "slot": "Ability1",
        "key": "Q",
        "ko": "기습",
        "en": "BLINDSIDE"
      },
      {
        "id": "yoru-e",
        "slot": "Ability2",
        "key": "E",
        "ko": "관문 충돌",
        "en": "GATECRASH"
      },
      {
        "id": "yoru-c",
        "slot": "Grenade",
        "key": "C",
        "ko": "기만",
        "en": "FAKEOUT"
      },
      {
        "id": "yoru-x",
        "slot": "Ultimate",
        "key": "X",
        "ko": "차원 표류",
        "en": "DIMENSIONAL DRIFT"
      }
    ]
  }
];

export const CATALOG_MAPS: CatalogMap[] = [
  {
    "key": "ascent",
    "uuid": "7EAECC1B-4337-BBF6-6AB9-04B8F06B3319",
    "ko": "어센트",
    "en": "Ascent",
    "minimap": {
      "xMultiplier": 7.000000187e-05,
      "yMultiplier": -7.000000187e-05,
      "xScalarToAdd": 0.8138949871,
      "yScalarToAdd": 0.5732420087
    }
  },
  {
    "key": "bind",
    "uuid": "2C9D57EC-4431-9C5E-2939-8F9EF6DD5CBA",
    "ko": "바인드",
    "en": "Bind",
    "minimap": {
      "xMultiplier": 5.900000178e-05,
      "yMultiplier": -5.900000178e-05,
      "xScalarToAdd": 0.5769410133,
      "yScalarToAdd": 0.9675660133
    }
  },
  {
    "key": "breeze",
    "uuid": "2FB9A4FD-47B8-4E7D-A969-74B4046EBD53",
    "ko": "브리즈",
    "en": "Breeze",
    "minimap": {
      "xMultiplier": 7.000000187e-05,
      "yMultiplier": -7.000000187e-05,
      "xScalarToAdd": 0.4651229978,
      "yScalarToAdd": 0.8330780268
    }
  },
  {
    "key": "fracture",
    "uuid": "B529448B-4D60-346E-E89E-00A4C527A405",
    "ko": "프랙처",
    "en": "Fracture",
    "minimap": {
      "xMultiplier": 7.79999973e-05,
      "yMultiplier": -7.79999973e-05,
      "xScalarToAdd": 0.5569519997,
      "yScalarToAdd": 1.155886054
    }
  },
  {
    "key": "haven",
    "uuid": "2BEE0DC9-4FFE-519B-1CBD-7FBE763A6047",
    "ko": "헤이븐",
    "en": "Haven",
    "minimap": {
      "xMultiplier": 7.500000356e-05,
      "yMultiplier": -7.500000356e-05,
      "xScalarToAdd": 1.09344995,
      "yScalarToAdd": 0.6427279711
    }
  },
  {
    "key": "icebox",
    "uuid": "E2AD5C54-4114-A870-9641-8EA21279579A",
    "ko": "아이스박스",
    "en": "Icebox",
    "minimap": {
      "xMultiplier": 7.200000255e-05,
      "yMultiplier": -7.200000255e-05,
      "xScalarToAdd": 0.460213989,
      "yScalarToAdd": 0.3046869934
    }
  },
  {
    "key": "lotus",
    "uuid": "2FE4ED3A-450A-948B-6D6B-E89A78E680A9",
    "ko": "로터스",
    "en": "Lotus",
    "minimap": {
      "xMultiplier": 7.200000255e-05,
      "yMultiplier": -7.200000255e-05,
      "xScalarToAdd": 0.4547890127,
      "yScalarToAdd": 0.9177520275
    }
  },
  {
    "key": "pearl",
    "uuid": "FD267378-4D1D-484F-FF52-77821ED10DC2",
    "ko": "펄",
    "en": "Pearl",
    "minimap": {
      "xMultiplier": 7.79999973e-05,
      "yMultiplier": -7.79999973e-05,
      "xScalarToAdd": 0.4804689884,
      "yScalarToAdd": 0.9160159826
    }
  },
  {
    "key": "split",
    "uuid": "D960549E-485C-E861-8D71-AA9D1AED12A2",
    "ko": "스플릿",
    "en": "Split",
    "minimap": {
      "xMultiplier": 7.79999973e-05,
      "yMultiplier": -7.79999973e-05,
      "xScalarToAdd": 0.8421880007,
      "yScalarToAdd": 0.6975780129
    }
  },
  {
    "key": "sunset",
    "uuid": "92584FBE-486A-B1B2-9FAA-39B0F486B498",
    "ko": "선셋",
    "en": "Sunset",
    "minimap": {
      "xMultiplier": 7.79999973e-05,
      "yMultiplier": -7.79999973e-05,
      "xScalarToAdd": 0.5,
      "yScalarToAdd": 0.515625
    }
  }
];

export const CATALOG_WEAPONS: CatalogWeapon[] = [
  {
    "key": "ares",
    "uuid": "55D8A0F4-4274-CA67-FE2C-06AB45EFDF58",
    "ko": "아레스",
    "en": "Ares",
    "category": "중화기",
    "fireRate": 13,
    "magazine": 50,
    "headDamage": 72,
    "bodyDamage": 30,
    "legDamage": 25.5
  },
  {
    "key": "bucky",
    "uuid": "910BE174-449B-C412-AB22-D0873436B21B",
    "ko": "버키",
    "en": "Bucky",
    "category": "산탄총",
    "fireRate": 1.1,
    "magazine": 5,
    "headDamage": 40,
    "bodyDamage": 20,
    "legDamage": 17
  },
  {
    "key": "bulldog",
    "uuid": "AE3DE142-4D85-2547-DD26-4E90BED35CF7",
    "ko": "불독",
    "en": "Bulldog",
    "category": "소총",
    "fireRate": 10,
    "magazine": 24,
    "headDamage": 115.5,
    "bodyDamage": 35,
    "legDamage": 29.75
  },
  {
    "key": "classic",
    "uuid": "29A0CFAB-485B-F5D5-779A-B59F85E204A8",
    "ko": "클래식",
    "en": "Classic",
    "category": "권총",
    "fireRate": 6.75,
    "magazine": 12,
    "headDamage": 78,
    "bodyDamage": 26,
    "legDamage": 22.1
  },
  {
    "key": "frenzy",
    "uuid": "44D4E95C-4157-0037-81B2-17841BF2E8E3",
    "ko": "프렌지",
    "en": "Frenzy",
    "category": "권총",
    "fireRate": 10,
    "magazine": 13,
    "headDamage": 78,
    "bodyDamage": 26,
    "legDamage": 22.1
  },
  {
    "key": "ghost",
    "uuid": "1BAA85B4-4C70-1284-64BB-6481DFC3BB4E",
    "ko": "고스트",
    "en": "Ghost",
    "category": "권총",
    "fireRate": 6.75,
    "magazine": 15,
    "headDamage": 105,
    "bodyDamage": 30,
    "legDamage": 25.5
  },
  {
    "key": "guardian",
    "uuid": "4ADE7FAA-4CF1-8376-95EF-39884480959B",
    "ko": "가디언",
    "en": "Guardian",
    "category": "소총",
    "fireRate": 5.25,
    "magazine": 12,
    "headDamage": 195,
    "bodyDamage": 65,
    "legDamage": 48.75
  },
  {
    "key": "judge",
    "uuid": "EC845BF4-4F79-DDDA-A3DA-0DB3774B2794",
    "ko": "저지",
    "en": "Judge",
    "category": "산탄총",
    "fireRate": 3.5,
    "magazine": 5,
    "headDamage": 34,
    "bodyDamage": 17,
    "legDamage": 14.45
  },
  {
    "key": "marshal",
    "uuid": "C4883E50-4494-202C-3EC3-6B8A9284F00B",
    "ko": "마샬",
    "en": "Marshal",
    "category": "저격총",
    "fireRate": 1.5,
    "magazine": 5,
    "headDamage": 202,
    "bodyDamage": 101,
    "legDamage": 85.85
  },
  {
    "key": "odin",
    "uuid": "63E6C2B6-4A8E-869C-3D4C-E38355226584",
    "ko": "오딘",
    "en": "Odin",
    "category": "중화기",
    "fireRate": 12,
    "magazine": 100,
    "headDamage": 95,
    "bodyDamage": 38,
    "legDamage": 32.3
  },
  {
    "key": "operator",
    "uuid": "A03B24D3-4319-996D-0F8C-94BBFBA1DFC7",
    "ko": "오퍼레이터",
    "en": "Operator",
    "category": "저격총",
    "fireRate": 0.6,
    "magazine": 5,
    "headDamage": 255,
    "bodyDamage": 150,
    "legDamage": 120
  },
  {
    "key": "outlaw",
    "uuid": "5F0AAF7A-4289-3998-D5FF-EB9A5CF7EF5C",
    "ko": "아웃로",
    "en": "Outlaw",
    "category": "저격총",
    "fireRate": 2.75,
    "magazine": 2,
    "headDamage": 238,
    "bodyDamage": 140,
    "legDamage": 119
  },
  {
    "key": "phantom",
    "uuid": "EE8E8D15-496B-07AC-E5F6-8FAE5D4C7B1A",
    "ko": "팬텀",
    "en": "Phantom",
    "category": "소총",
    "fireRate": 11,
    "magazine": 30,
    "headDamage": 156,
    "bodyDamage": 39,
    "legDamage": 33.15
  },
  {
    "key": "sheriff",
    "uuid": "E336C6B8-418D-9340-D77F-7A9E4CFE0702",
    "ko": "셰리프",
    "en": "Sheriff",
    "category": "권총",
    "fireRate": 4,
    "magazine": 6,
    "headDamage": 159.5,
    "bodyDamage": 55,
    "legDamage": 46.75
  },
  {
    "key": "shorty",
    "uuid": "42DA8CCC-40D5-AFFC-BEEC-15AA47B42EDA",
    "ko": "쇼티",
    "en": "Shorty",
    "category": "권총",
    "fireRate": 3.33,
    "magazine": 2,
    "headDamage": 22,
    "bodyDamage": 11,
    "legDamage": 9.35
  },
  {
    "key": "spectre",
    "uuid": "462080D1-4035-2937-7C09-27AA2A5C27A7",
    "ko": "스펙터",
    "en": "Spectre",
    "category": "기관단총",
    "fireRate": 13.33,
    "magazine": 30,
    "headDamage": 78,
    "bodyDamage": 26,
    "legDamage": 22.1
  },
  {
    "key": "stinger",
    "uuid": "F7E1B454-4AD4-1063-EC0A-159E56B58941",
    "ko": "스팅어",
    "en": "Stinger",
    "category": "기관단총",
    "fireRate": 16,
    "magazine": 20,
    "headDamage": 67.5,
    "bodyDamage": 27,
    "legDamage": 22.95
  },
  {
    "key": "vandal",
    "uuid": "9C82E19D-4575-0200-1A81-3EACF00CF872",
    "ko": "밴달",
    "en": "Vandal",
    "category": "소총",
    "fireRate": 9.75,
    "magazine": 25,
    "headDamage": 160,
    "bodyDamage": 40,
    "legDamage": 34
  }
];

export const CATALOG_ROLES: CatalogRole[] = [
  {
    "key": "duelist",
    "uuid": "DBE8757E-9E92-4ED4-B39F-9DFC589691D4",
    "ko": "타격대",
    "en": "Duelist"
  },
  {
    "key": "initiator",
    "uuid": "1B47567F-8F7B-444B-AAE3-B0C634622D10",
    "ko": "척후대",
    "en": "Initiator"
  },
  {
    "key": "sentinel",
    "uuid": "5FC02F99-4091-4486-A531-98459A3E95E9",
    "ko": "감시자",
    "en": "Sentinel"
  },
  {
    "key": "controller",
    "uuid": "4EE40330-ECDD-4F2F-98A8-EB1243428373",
    "ko": "전략가",
    "en": "Controller"
  }
];
