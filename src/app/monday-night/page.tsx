import CompetitionPage from "@/components/CompetitionPage";
import { publicMetadata } from "@/lib/public-metadata";
export const metadata = publicMetadata("Monday Night", "Monday Night futsal fixtures, standings, results and previous seasons at Endeavour Hills Leisure Centre.", "/monday-night/");
export default function MondayNightPage() { return <CompetitionPage night="monday" />; }
