import React, { useState, useEffect } from "react";
import { type Campaign, type CampaignLog, getCampaignLogs } from "../../lib/supabase";
import { X } from "lucide-react";

interface CampaignLogProps {
  campaign?: Campaign;
  onClose: () => void;
}

const CampaignLog: React.FC<CampaignLogProps> = ({ campaign, onClose }) => {
  const [campaignlogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"success" | "info" | "errors">("errors");

  useEffect(() => {
    const fetchCampaignLogs = async (campaign) => {
      try {
        const campaignLogs = await getCampaignLogs(campaign.id);
        setCampaignLogs(campaignLogs);
      } catch (err) {
        console.error("Error fetching campaign logs:", err);
        setError("Error fetching campaign logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignLogs(campaign);
  }, [campaign]);

  const groupedLogs = campaignlogs.reduce((acc, log) => {
    const date = log.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, CampaignLog[]>);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-slideDown">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Campaign Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 py-2">
          <nav className="-mb-px flex space-x-8">
            {["Success", "Infos", "Errors"].map((tab) => {
              const tabKey = tab.toLowerCase() as "success" | "info" | "errors";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabKey)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tabKey
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                  `}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logs Grouped by Date */}
        <div className="px-6 py-4 space-y-4">
          {Object.entries(groupedLogs).map(([date, logs]) => {
            const filteredMessages = logs.flatMap((log) => {
              if (activeTab === "success") {
                return (log.details?.success_msg || []).flat();
              }
              if (activeTab === "info") return log.details?.info || [];
              if (activeTab === "errors")
                return [
                  ...(log.details?.big_error || []),
                  ...(log.details?.small_error || []),
                ];
              return [];
            });

            return (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{date}</h3>
                {filteredMessages.length > 0 ? (
                  <>
                    {activeTab === "success" && typeof filteredMessages[0] === "object" ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              {Object.keys(filteredMessages[0] || {}).map((key) => (
                                <th
                                  key={key}
                                  className="px-3 py-2 text-left font-medium text-gray-700 border"
                                >
                                  {key.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMessages.map((msg: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                {Object.values(msg).map((val, index) => (
                                  <td
                                    key={index}
                                    className="px-3 py-2 border text-gray-800"
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <ul className="list-disc pl-5 text-gray-800">
                        {filteredMessages.map((msg, idx) => (
                          <li key={idx} className="mb-1">
                            {typeof msg === "string" ? msg : JSON.stringify(msg)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No {activeTab} logs for this date.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignLog;
