import CompetitionPage from "@/components/CompetitionPage";
import { publicMetadata } from "@/lib/public-metadata";
export const metadata = publicMetadata("Wednesday Night", "Wednesday Night futsal fixtures, standings, results and previous seasons at Endeavour Hills Leisure Centre.", "/wednesday-night/");
export default function WednesdayNightPage() { return <CompetitionPage night="wednesday" />; }
