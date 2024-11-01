import Layout from "@/components/layout/Layout";
import { withAuth } from "@/components/auth/withAuth";

function HomePage() {
  return (
    <Layout>
      <h1>대시보드</h1>
    </Layout>
  );
}

export default withAuth(HomePage);
