import { BACKEND_URL } from "@/lib/constants";
import axios from "axios";


interface AuditData {
    AppType: string;
    Activity: string;
    Action: string;
    NewData: string;
    OldData: string;
    Remarks: string;
    UserId: string;
    PlantCode: string;
  }


  const insertAuditTrail = async (auditData: AuditData) => {
    try {
      await axios.post(`${BACKEND_URL}/api/audit/insert-audit-trail`, auditData);
    } catch (error) {
      console.error('Error inserting audit trail:', error);
    }
  };


  export default insertAuditTrail