import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PixelButton from "@/components/PixelButton";

const PreLoginHome = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-6xl font-pixel text-primary mb-6">Welcome to washQ</h1>
        <p className="text-lg text-muted-foreground mb-8">Your smart laundry solution.</p>
        <PixelButton
          variant="primary"
          size="lg"
          onClick={() => navigate("/login")}
        >
          Login
        </PixelButton>
      </div>
    </Layout>
  );
};

export default PreLoginHome;