import { TalentApp } from "@/components/platform/TalentApp";
export default async function Page({params}:{params:Promise<{screen?:string[]}>}) {
const {screen=[]}=await params;return <TalentApp segments={screen}/>;
}
