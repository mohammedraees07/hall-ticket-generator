import postgres from "postgres";

const regions = ["ap-south-1", "eu-central-1", "us-east-1", "us-west-1", "ap-southeast-1"];
for (const region of regions) {
  const url = `postgresql://postgres.sxxblqdvwebhloavmufh:Thaseen1122m10@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  try {
    const sql = postgres(url, { connect_timeout: 3 });
    const res = await sql`SELECT 1 as connected`;
    console.log(`CONNECTED TO REGION: ${region}!`, res);
    process.exit(0);
  } catch (e) {
    // try next
  }
}
console.log("Could not auto-detect region");
