import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public", "products");
await mkdir(OUT, { recursive: true });

const defs = `
<defs>
  <filter id="floor" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="26"/>
  </filter>
  <filter id="lift" x="-40%" y="-40%" width="180%" height="200%">
    <feDropShadow dx="0" dy="20" stdDeviation="20" flood-color="#101318" flood-opacity="0.16"/>
  </filter>
  <filter id="lift-soft" x="-40%" y="-40%" width="180%" height="200%">
    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#101318" flood-opacity="0.12"/>
  </filter>
  <linearGradient id="paper" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#fcfaf4"/>
    <stop offset="0.56" stop-color="#efe9dd"/>
    <stop offset="1" stop-color="#dcd3c4"/>
  </linearGradient>
  <linearGradient id="paper-side" x1="0" y1="0" x2="1" y2="0.5">
    <stop offset="0" stop-color="#cfc5b5"/>
    <stop offset="1" stop-color="#aaa092"/>
  </linearGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#3b4047"/>
    <stop offset="0.55" stop-color="#1a1d21"/>
    <stop offset="1" stop-color="#0c0e10"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8f897e"/>
    <stop offset="0.18" stop-color="#f1ede5"/>
    <stop offset="0.46" stop-color="#b7b0a3"/>
    <stop offset="0.72" stop-color="#ece7dd"/>
    <stop offset="1" stop-color="#8b857a"/>
  </linearGradient>
  <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#4561ff"/>
    <stop offset="1" stop-color="#1732d8"/>
  </linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#f3f8ff"/>
    <stop offset="0.55" stop-color="#dbe8fb"/>
    <stop offset="1" stop-color="#bdcee8"/>
  </linearGradient>
  <linearGradient id="sand" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0" stop-color="#eee1c9"/>
    <stop offset="0.6" stop-color="#ddcdb2"/>
    <stop offset="1" stop-color="#c5b393"/>
  </linearGradient>
  <linearGradient id="glass" x1="0.1" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#fffef9" stop-opacity="0.98"/>
    <stop offset="0.5" stop-color="#f4efe4" stop-opacity="0.94"/>
    <stop offset="1" stop-color="#cfc6b6" stop-opacity="0.9"/>
  </linearGradient>
  <radialGradient id="warm-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffd889" stop-opacity="0.55"/>
    <stop offset="0.5" stop-color="#ffd889" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#ffd889" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="white-glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fade-down" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe1a0" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#ffe1a0" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#f8f5ee"/>
    <stop offset="0.6" stop-color="#e9e3d7"/>
    <stop offset="1" stop-color="#d5ccbd"/>
  </linearGradient>
  <linearGradient id="hood" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#e5d8c2"/>
    <stop offset="0.6" stop-color="#d3c2a8"/>
    <stop offset="1" stop-color="#b9a789"/>
  </linearGradient>
  <linearGradient id="canvas" x1="0" y1="0" x2="0.8" y2="1">
    <stop offset="0" stop-color="#efe6d2"/>
    <stop offset="0.6" stop-color="#e0d2b8"/>
    <stop offset="1" stop-color="#c8b796"/>
  </linearGradient>
</defs>`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">${defs}${body}</svg>`;

const products = {
  "halo-bulb": `
    <circle cx="600" cy="500" r="360" fill="url(#warm-glow)"/>
    <ellipse cx="600" cy="948" rx="238" ry="34" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M600 748C500 748 402 672 392 550C380 404 470 292 600 292C730 292 820 404 808 550C798 672 700 748 600 748Z" fill="url(#glass)" stroke="#d4ccbe" stroke-width="2.5"/>
      <path d="M600 720C520 720 444 660 432 558C420 448 486 330 600 330C714 330 780 448 768 558C756 660 680 720 600 720Z" fill="url(#white-glow)" opacity="0.5"/>
      <path d="M481 416C514 352 580 328 631 330C565 368 520 435 507 514" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" opacity="0.6"/>
      <path d="M708 620C734 582 744 530 738 482" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity="0.38"/>
      <rect x="510" y="734" width="180" height="44" rx="20" fill="url(#metal)" stroke="#8f887c" stroke-width="1.5"/>
      <rect x="510" y="772" width="180" height="18" rx="9" fill="url(#blue)"/>
      <path d="M514 798H686V846C686 862 674 874 658 874H542C526 874 514 862 514 846Z" fill="url(#metal)" stroke="#8e877b" stroke-width="1.5"/>
      <path d="M514 814H686M514 836H686M514 858H686" stroke="#8a8377" stroke-width="5" opacity="0.5"/>
      <rect x="532" y="874" width="136" height="24" rx="12" fill="#26292d"/>
      <circle cx="600" cy="843" r="4" fill="#2743ff"/>
    </g>`,
  "arc-floor-lamp": `
    <ellipse cx="445" cy="982" rx="230" ry="38" fill="#111418" opacity="0.12" filter="url(#floor)"/>
    <path d="M420 952V492C420 268 704 218 786 388" fill="none" stroke="url(#ink)" stroke-width="20" stroke-linecap="round" filter="url(#lift-soft)"/>
    <ellipse cx="420" cy="960" rx="196" ry="40" fill="url(#ink)"/>
    <ellipse cx="420" cy="948" rx="196" ry="34" fill="url(#ink)"/>
    <ellipse cx="420" cy="944" rx="130" ry="20" fill="#3b4047" opacity="0.55"/>
    <circle cx="790" cy="395" r="15" fill="url(#blue)"/>
    <g transform="translate(790 400) rotate(13)">
      <path d="M-82 4H82L154 210C158 226 146 238 130 238H-130C-146 238-158 226-154 210Z" fill="url(#paper)" stroke="#cfc4b2" stroke-width="2" filter="url(#lift)"/>
      <ellipse cx="0" cy="230" rx="142" ry="29" fill="#e6ddcd" stroke="#cfc4b2" stroke-width="2"/>
      <ellipse cx="0" cy="227" rx="122" ry="21" fill="#f6d99b"/>
      <ellipse cx="0" cy="227" rx="75" ry="12" fill="#ffe8b3" opacity="0.8"/>
      <path d="M-142 220L-246 492H246L142 220Z" fill="url(#fade-down)" opacity="0.32"/>
    </g>
    <path d="M404 932H436" stroke="#2743ff" stroke-width="8" stroke-linecap="round"/>`,
  "line-strip": `
    <ellipse cx="590" cy="976" rx="300" ry="38" fill="#111418" opacity="0.1" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M286 764C264 618 438 586 568 638C728 702 780 548 692 476C604 404 478 448 438 344" fill="none" stroke="#cfc6b7" stroke-width="44" stroke-linecap="round"/>
      <path d="M286 764C264 618 438 586 568 638C728 702 780 548 692 476C604 404 478 448 438 344" fill="none" stroke="#f8f4eb" stroke-width="34" stroke-linecap="round"/>
      <path d="M286 764C264 618 438 586 568 638C728 702 780 548 692 476C604 404 478 448 438 344" fill="none" stroke="#6d9cff" stroke-width="9" stroke-linecap="round" stroke-dasharray="1 31" opacity="0.9"/>
      <rect x="198" y="704" width="178" height="136" rx="30" fill="url(#paper)" stroke="#cfc4b2" stroke-width="2"/>
      <rect x="198" y="704" width="48" height="136" rx="24" fill="url(#paper-side)" opacity="0.45"/>
      <rect x="226" y="732" width="92" height="44" rx="12" fill="url(#ink)"/>
      <circle cx="272" cy="754" r="7" fill="#6d9cff"/>
      <circle cx="313" cy="798" r="16" fill="url(#blue)"/>
      <circle cx="313" cy="798" r="7" fill="#eaf0ff"/>
      <rect x="244" y="788" width="52" height="18" rx="9" fill="#c9beae" opacity="0.7"/>
      <path d="M370 772C420 790 438 838 480 858C520 878 558 858 580 822" fill="none" stroke="#24282d" stroke-width="12" stroke-linecap="round"/>
      <path d="M580 822L610 794" fill="none" stroke="#24282d" stroke-width="12" stroke-linecap="round"/>
      <rect x="606" y="772" width="62" height="48" rx="14" fill="url(#ink)"/>
    </g>`,
  "plug-mini": `
    <ellipse cx="600" cy="906" rx="250" ry="36" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M392 348H760C792 348 818 374 818 406V764C818 796 792 822 760 822H392C360 822 334 796 334 764V406C334 374 360 348 392 348Z" fill="url(#paper-side)"/>
      <rect x="334" y="324" width="484" height="474" rx="70" fill="url(#paper)" stroke="#cfc4b2" stroke-width="2"/>
      <rect x="360" y="350" width="432" height="422" rx="52" fill="#fbf8f1" stroke="#e1d9cb" stroke-width="2"/>
      <rect x="568" y="444" width="64" height="102" rx="26" fill="#24282d"/>
      <rect x="578" y="456" width="44" height="78" rx="18" fill="#0f1113"/>
      <rect x="484" y="600" width="92" height="54" rx="22" fill="#24282d"/>
      <rect x="500" y="612" width="60" height="30" rx="12" fill="#0f1113"/>
      <rect x="624" y="600" width="92" height="54" rx="22" fill="#24282d"/>
      <rect x="640" y="612" width="60" height="30" rx="12" fill="#0f1113"/>
      <circle cx="576" cy="728" r="10" fill="url(#blue)"/>
      <text x="606" y="756" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" letter-spacing="0.3" fill="#6e6a62">cloud.</text>
      <path d="M360 350H792" stroke="#ffffff" stroke-width="10" opacity="0.6"/>
    </g>`,
  "current-strip": `
    <ellipse cx="600" cy="848" rx="350" ry="36" fill="#111418" opacity="0.1" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M270 526H862C894 526 920 552 920 584V666C920 698 894 724 862 724H270C238 724 212 698 212 666V584C212 552 238 526 270 526Z" fill="url(#paper-side)"/>
      <rect x="212" y="500" width="708" height="214" rx="58" fill="url(#paper)" stroke="#cfc4b2" stroke-width="2"/>
      <rect x="240" y="526" width="652" height="162" rx="38" fill="#fbf8f1" stroke="#e2dacd" stroke-width="2"/>
      <g fill="#24282d">
        <rect x="280" y="556" width="26" height="44" rx="11"/><rect x="252" y="616" width="54" height="22" rx="10"/><rect x="280" y="616" width="26" height="22" rx="10" opacity="0"/>
        <rect x="434" y="556" width="26" height="44" rx="11"/><rect x="398" y="616" width="54" height="22" rx="10"/><rect x="442" y="616" width="54" height="22" rx="10"/>
        <rect x="588" y="556" width="26" height="44" rx="11"/><rect x="552" y="616" width="54" height="22" rx="10"/><rect x="596" y="616" width="54" height="22" rx="10"/>
        <rect x="742" y="556" width="26" height="44" rx="11"/><rect x="706" y="616" width="54" height="22" rx="10"/><rect x="750" y="616" width="54" height="22" rx="10"/>
      </g>
      <g fill="#0f1113">
        <rect x="290" y="566" width="8" height="24" rx="4"/><rect x="267" y="624" width="26" height="8" rx="4"/><rect x="452" y="624" width="26" height="8" rx="4"/><rect x="470" y="624" width="26" height="8" rx="4"/>
        <rect x="606" y="624" width="26" height="8" rx="4"/><rect x="624" y="624" width="26" height="8" rx="4"/><rect x="760" y="624" width="26" height="8" rx="4"/><rect x="778" y="624" width="26" height="8" rx="4"/>
      </g>
      <circle cx="842" cy="566" r="20" fill="url(#blue)"/>
      <rect x="826" y="560" width="32" height="12" rx="6" fill="#eaf0ff"/>
      <path d="M212 640C150 640 122 674 122 716C122 766 160 784 196 784" fill="none" stroke="#24282d" stroke-width="15" stroke-linecap="round"/>
      <path d="M196 784H278" stroke="#24282d" stroke-width="15" stroke-linecap="round"/>
      <rect x="278" y="758" width="76" height="52" rx="16" fill="url(#ink)"/>
      <text x="616" y="542" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="1.2" fill="#9c9488">CLOUD CURRENT 4</text>
    </g>`,
  "orbit-power-cube": `
    <ellipse cx="600" cy="902" rx="270" ry="38" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M350 430L600 550L850 430L600 310Z" fill="#faf7ef" stroke="#faf7ef" stroke-width="20" stroke-linejoin="round"/>
      <path d="M350 430L600 550V860L350 740Z" fill="#d8cfc0" stroke="#d8cfc0" stroke-width="20" stroke-linejoin="round"/>
      <path d="M850 430L600 550V860L850 740Z" fill="#eee7db" stroke="#eee7db" stroke-width="20" stroke-linejoin="round"/>
      <path d="M350 430L600 550L850 430" fill="none" stroke="#c8bead" stroke-width="3"/>
      <path d="M600 550V860" stroke="#c8bead" stroke-width="3"/>
      <ellipse cx="600" cy="421" rx="96" ry="48" fill="#dbe7f6"/>
      <ellipse cx="600" cy="415" rx="66" ry="29" fill="url(#blue)" opacity="0.9"/>
      <g transform="translate(674 588) skewY(30)">
        <rect x="0" y="0" width="148" height="204" rx="32" fill="#fbf8f1" stroke="#d6ccbc" stroke-width="3"/>
        <rect x="56" y="24" width="36" height="58" rx="14" fill="#22262b"/>
        <rect x="20" y="112" width="50" height="30" rx="12" fill="#22262b"/>
        <rect x="78" y="112" width="50" height="30" rx="12" fill="#22262b"/>
        <circle cx="74" cy="174" r="8" fill="url(#blue)"/>
      </g>
      <g transform="translate(376 576) skewY(-30)">
        <rect x="0" y="92" width="82" height="26" rx="13" fill="#3b4047"/>
        <rect x="0" y="132" width="54" height="18" rx="9" fill="#3b4047"/>
        <text x="0" y="58" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#7b7469">cloud.</text>
      </g>
      <circle cx="600" cy="332" r="10" fill="url(#blue)"/>
    </g>`,
  "kettle-one": `
    <ellipse cx="600" cy="976" rx="290" ry="40" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <path d="M430 492C330 504 300 620 318 718C328 772 368 798 414 782" fill="none" stroke="url(#ink)" stroke-width="46" stroke-linecap="round" filter="url(#lift-soft)"/>
    <g filter="url(#lift)">
      <ellipse cx="600" cy="918" rx="238" ry="42" fill="url(#ink)"/>
      <path d="M430 438C430 408 770 408 770 438L810 826C816 888 384 888 390 826Z" fill="url(#paper)" stroke="#cfc4b2" stroke-width="3"/>
      <path d="M780 480C884 462 940 496 950 552C956 588 936 612 908 612C880 612 860 596 844 570C828 546 810 536 786 548Z" fill="url(#paper)" stroke="#cfc4b2" stroke-width="3"/>
      <path d="M914 548C928 552 936 566 935 580" fill="none" stroke="#a99f8f" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="600" cy="432" rx="172" ry="42" fill="#f4efe4" stroke="#cfc4b2" stroke-width="3"/>
      <ellipse cx="600" cy="424" rx="146" ry="30" fill="#e4dccd"/>
      <rect x="560" y="392" width="80" height="22" rx="11" fill="url(#ink)"/>
      <path d="M540 510H640V748C640 762 630 772 616 772H564C550 772 540 762 540 748Z" fill="url(#sky)" opacity="0.62"/>
      <path d="M552 652C580 640 610 640 636 652V744C636 756 627 764 616 764H572C561 764 552 756 552 744Z" fill="#9fc5f7" opacity="0.7"/>
      <path d="M540 512V770" stroke="#ffffff" stroke-width="4" opacity="0.7"/>
      <path d="M466 818H734" stroke="#d3c9b9" stroke-width="3"/>
      <circle cx="704" cy="846" r="9" fill="url(#blue)"/>
      <text x="600" y="856" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" letter-spacing="0.4" fill="#7f786d">cloud.</text>
      <path d="M470 520C450 650 436 754 430 828" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity="0.48"/>
    </g>`,
  "air-four": `
    <ellipse cx="600" cy="952" rx="300" ry="40" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M310 392H890C916 392 938 414 938 440V864C938 890 916 912 890 912H310C284 912 262 890 262 864V440C262 414 284 392 310 392Z" fill="url(#paper-side)"/>
      <rect x="262" y="360" width="676" height="520" rx="58" fill="url(#paper)" stroke="#cfc4b2" stroke-width="3"/>
      <rect x="298" y="396" width="604" height="130" rx="34" fill="#fbf8f1" stroke="#e1d8c9" stroke-width="2"/>
      <rect x="326" y="420" width="244" height="82" rx="18" fill="url(#ink)"/>
      <text x="350" y="464" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="1.5" fill="#6d9cff">180°C</text>
      <text x="350" y="488" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="2" fill="#9aa8bf">AIR · 24 MIN</text>
      <circle cx="738" cy="460" r="38" fill="#fbf8f1" stroke="#cfc4b2" stroke-width="3"/>
      <circle cx="738" cy="460" r="23" fill="url(#ink)"/>
      <path d="M738 436V450" stroke="#6d9cff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="850" cy="430" r="9" fill="url(#blue)"/>
      <rect x="298" y="556" width="604" height="288" rx="32" fill="#f5f0e6" stroke="#d8cebe" stroke-width="3"/>
      <rect x="326" y="586" width="548" height="196" rx="24" fill="#2b3036"/>
      <rect x="350" y="610" width="500" height="148" rx="16" fill="#1b1e22"/>
      <path d="M470 664H700" stroke="#51575d" stroke-width="3" stroke-linecap="round"/>
      <path d="M500 686H670" stroke="#51575d" stroke-width="3" stroke-linecap="round"/>
      <rect x="488" y="728" width="224" height="34" rx="17" fill="#3e444b"/>
      <rect x="512" y="736" width="176" height="8" rx="4" fill="#8d959e" opacity="0.55"/>
      <text x="600" y="668" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="2" fill="#6a7178">CLOUD AIR 4</text>
      <path d="M372 900H392M808 900H828" stroke="#24282d" stroke-width="14" stroke-linecap="round"/>
    </g>`,
  "blend-mini": `
    <ellipse cx="600" cy="952" rx="230" ry="36" fill="#111418" opacity="0.11" filter="url(#floor)"/>
    <g filter="url(#lift)">
      <path d="M430 704H770C804 704 828 730 828 760V860C828 892 802 918 770 918H430C398 918 372 892 372 860V760C372 730 396 704 430 704Z" fill="url(#paper)" stroke="#cfc4b2" stroke-width="3"/>
      <rect x="404" y="738" width="392" height="138" rx="32" fill="#fbf8f1" stroke="#e1d8c9" stroke-width="2"/>
      <circle cx="670" cy="808" r="42" fill="url(#ink)"/>
      <circle cx="670" cy="808" r="24" fill="#3b4047"/>
      <path d="M670 786V798" stroke="#6d9cff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="480" cy="808" r="18" fill="url(#blue)"/>
      <circle cx="480" cy="808" r="7" fill="#dfe7ff"/>
      <text x="540" y="822" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#7d766b">cloud.</text>
      <path d="M472 704L494 318H706L728 704Z" fill="url(#glass)" stroke="#d0c7b8" stroke-width="3"/>
      <path d="M486 548L508 672C510 688 522 700 538 700H662C678 700 690 688 692 672L714 548Z" fill="#f1c18d" opacity="0.86"/>
      <path d="M480 548H720" stroke="#ffffff" stroke-width="5" opacity="0.45"/>
      <path d="M520 590H680M526 620H674M532 650H668" stroke="#d99d61" stroke-width="3" opacity="0.4"/>
      <rect x="462" y="274" width="276" height="70" rx="26" fill="url(#ink)"/>
      <rect x="496" y="292" width="208" height="22" rx="11" fill="#4a5058"/>
      <path d="M526 304H674" stroke="#8d959e" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
      <path d="M506 344V698M694 344V698" stroke="#ffffff" stroke-width="7" opacity="0.32"/>
      <path d="M558 694H642" stroke="#3b4047" stroke-width="6" stroke-linecap="round"/>
      <circle cx="600" cy="682" r="10" fill="#3b4047"/>
    </g>`,
  "everyday-tee": `
    <ellipse cx="600" cy="956" rx="300" ry="34" fill="#111418" opacity="0.1" filter="url(#floor)"/>
    <g filter="url(#lift-soft)">
      <path d="M468 344C512 328 552 384 600 384C648 384 688 328 732 344L848 392L942 566L818 634L764 550V884C690 914 510 914 436 884V550L382 634L258 566L352 392Z" fill="url(#cloth)" stroke="#d2c8b8" stroke-width="3"/>
      <path d="M468 344C516 412 684 412 732 344C704 392 496 392 468 344Z" fill="#d8cebf"/>
      <path d="M476 350C526 404 674 404 724 350" fill="none" stroke="#c0b5a4" stroke-width="7" stroke-linecap="round"/>
      <path d="M436 562V884M764 562V884" stroke="#d0c5b5" stroke-width="3"/>
      <path d="M382 634L436 550M818 634L764 550" stroke="#d0c5b5" stroke-width="3"/>
      <path d="M450 870C520 890 680 890 750 870" fill="none" stroke="#cfc4b3" stroke-width="4"/>
      <path d="M500 470C510 590 506 720 500 850" fill="none" stroke="#ffffff" stroke-width="9" opacity="0.22"/>
      <path d="M686 472C680 580 682 720 688 850" fill="none" stroke="#b8ad9c" stroke-width="4" opacity="0.28"/>
      <path d="M582 388C584 444 584 520 580 610" fill="none" stroke="#d7cdbe" stroke-width="4" opacity="0.44"/>
      <text x="600" y="604" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" letter-spacing="-1" fill="#2743ff">cloud.</text>
      <text x="600" y="646" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="3.4" fill="#7e776c">WEAR / 01</text>
      <rect x="474" y="824" width="78" height="22" rx="4" fill="none" stroke="#c6bbaa" stroke-width="2" stroke-dasharray="4 4" opacity="0.8"/>
    </g>`,
  "cloud-hoodie": `
    <ellipse cx="600" cy="964" rx="306" ry="36" fill="#111418" opacity="0.1" filter="url(#floor)"/>
    <g filter="url(#lift-soft)">
      <path d="M460 354C456 236 744 236 740 354C694 424 506 424 460 354Z" fill="url(#hood)" stroke="#c3b196" stroke-width="3"/>
      <ellipse cx="600" cy="352" rx="108" ry="58" fill="#b9a688" opacity="0.7"/>
      <path d="M470 344C514 328 686 328 730 344L850 390L944 570L818 640L764 552V888C686 920 514 920 436 888V552L382 640L256 570L350 390Z" fill="url(#hood)" stroke="#c3b196" stroke-width="3"/>
      <path d="M470 344C520 430 680 430 730 344C700 404 500 404 470 344Z" fill="#c9b79c"/>
      <path d="M480 354C530 420 670 420 720 354" fill="none" stroke="#a99476" stroke-width="7" stroke-linecap="round"/>
      <path d="M436 552V888M764 552V888" stroke="#b6a385" stroke-width="3"/>
      <path d="M382 640L436 552M818 640L764 552" stroke="#b6a385" stroke-width="3"/>
      <path d="M256 570L350 390L342 468L284 604Z" fill="#c7b498" opacity="0.5"/>
      <path d="M944 570L850 390L858 468L916 604Z" fill="#c7b498" opacity="0.5"/>
      <path d="M264 542L344 408V474L292 592Z" fill="#f0e4d1" opacity="0.28"/>
      <rect x="436" y="864" width="328" height="48" rx="20" fill="#c7b499"/>
      <path d="M454 876H746M454 890H746M454 902H746" stroke="#b19c7e" stroke-width="3" opacity="0.6"/>
      <path d="M470 696H730V820C658 848 542 848 470 820Z" fill="#cdbb9f" stroke="#b6a385" stroke-width="3"/>
      <path d="M488 704V812M712 704V812" stroke="#b09b7d" stroke-width="2" opacity="0.5"/>
      <path d="M522 398V548" stroke="#f6ede0" stroke-width="10" stroke-linecap="round"/>
      <path d="M678 398V548" stroke="#f6ede0" stroke-width="10" stroke-linecap="round"/>
      <circle cx="522" cy="560" r="10" fill="#f6ede0"/>
      <circle cx="678" cy="560" r="10" fill="#f6ede0"/>
      <text x="600" y="638" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" letter-spacing="-1" fill="#2743ff">cloud.</text>
      <path d="M474 670H726" stroke="#b6a385" stroke-width="2" stroke-dasharray="4 5" opacity="0.7"/>
    </g>`,
  "day-tote": `
    <ellipse cx="600" cy="966" rx="276" ry="36" fill="#111418" opacity="0.1" filter="url(#floor)"/>
    <g filter="url(#lift-soft)">
      <path d="M452 432C452 288 524 244 564 244C600 244 616 286 616 420" fill="none" stroke="#b59a6d" stroke-width="22" stroke-linecap="round"/>
      <path d="M584 420C584 286 600 244 636 244C676 244 748 288 748 432" fill="none" stroke="#b59a6d" stroke-width="22" stroke-linecap="round"/>
      <path d="M382 430H818L846 890C712 928 488 928 354 890Z" fill="url(#canvas)" stroke="#c3b193" stroke-width="3"/>
      <path d="M382 430H818L814 476H386Z" fill="#d2bea0" opacity="0.6"/>
      <path d="M386 476H814" stroke="#b5a083" stroke-width="3" stroke-dasharray="5 5"/>
      <path d="M412 498C400 638 398 766 406 878M788 498C800 638 802 766 794 878" fill="none" stroke="#c4b193" stroke-width="3" opacity="0.6"/>
      <path d="M452 430V886M748 430V886" stroke="#c4b193" stroke-width="2" opacity="0.45"/>
      <path d="M566 430V444M634 430V444" stroke="#8d7a5f" stroke-width="4"/>
      <text x="600" y="652" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="700" letter-spacing="-2" fill="#2743ff">cloud.</text>
      <text x="600" y="696" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="2.6" fill="#6e6659">THE GOOD STUFF, BROUGHT HOME.</text>
      <path d="M470 748H730" stroke="#b8a586" stroke-width="2" stroke-dasharray="3 5" opacity="0.65"/>
      <text x="600" y="826" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#9a8769">N° 01 / LAGOS</text>
    </g>`,
};

for (const [slug, body] of Object.entries(products)) {
  await writeFile(path.join(OUT, `${slug}.svg`), svg(body), "utf8");
  console.log(`wrote ${slug}.svg`);
}
