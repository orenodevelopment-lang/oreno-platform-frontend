import { CompanyApp } from "@/components/platform/CompanyApp";
export default async function Page({params}:{params:Promise<{screen?:string[]}>}) {
const {screen=[]}=await params;return <CompanyApp segments={screen}/>;
}
