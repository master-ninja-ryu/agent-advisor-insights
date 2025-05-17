import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cryptocurrency } from '@/data/cryptocurrencies';
import { ANALYSTS } from '@/data/analysts';

interface AnalysisProps {
  selectedCrypto: Cryptocurrency;
  selectedAnalyst: string;
}

interface AnalysisResult {
  [key: string]: unknown;
}

interface AgentStatus {
  agent: string;
  status: string;
  progress: number;
  isComplete: boolean;
}

const Analysis: React.FC<AnalysisProps> = ({ selectedCrypto, selectedAnalyst }) => {
  const navigate = useNavigate();
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  const selectedAnalystInfo = ANALYSTS.find(a => a.id === selectedAnalyst);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('http://192.168.110.81:8000/hedge-fund/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tickers: [`${selectedCrypto.symbol}-USDT`],
            selected_agents: ['technical_analyst'],
            model_name: "deepseek-reasoner",
            crypto: true
          }),
        });

        if (!response.ok) {
          throw new Error('分析请求失败');
        }

        if (!response.body) {
          throw new Error('响应体为空');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('事件流结束');
            setIsLoading(false);
            // 分析完成时，将所有agent标记为完成
            setAgentStatuses(prev => prev.map(status => ({ ...status, isComplete: true })));
            setAnalysisCompleted(true);
            break;
          }

          const chunk = decoder.decode(value);
          const events = chunk.split('\n\n');
          
          for (const event of events) {
            if (!event.trim()) continue;
            
            const lines = event.split('\n');
            let eventName = 'message';
            let eventData: unknown = null;
            
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              }
              if (line.startsWith('data:')) {
                try {
                  eventData = JSON.parse(line.slice(5));
                } catch (e) {
                  eventData = line.slice(5);
                }
              }
            }

            if (eventName === 'progress' && typeof eventData === 'object' && eventData !== null) {
              const data = eventData as { agent?: string; status?: string; progress?: number };
              if (data.agent) {
                setAgentStatuses(prev => {
                  const existingIndex = prev.findIndex(item => item.agent === data.agent);
                  if (existingIndex >= 0) {
                    // 更新现有agent的状态
                    const newStatuses = [...prev];
                    newStatuses[existingIndex] = {
                      agent: data.agent!,
                      status: data.status || '',
                      progress: data.progress || 0,
                      isComplete: false
                    };
                    return newStatuses;
                  } else {
                    // 添加新的agent，并将之前的agent标记为完成
                    return prev.map(status => ({ ...status, isComplete: true })).concat({
                      agent: data.agent,
                      status: data.status || '',
                      progress: data.progress || 0,
                      isComplete: false
                    });
                  }
                });
              }
            } else if (eventName === 'result' && typeof eventData === 'object' && eventData !== null) {
              setAnalysisResult(eventData as AnalysisResult);
              setIsLoading(false);
              setAnalysisCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error('发送分析请求时出错:', error);
        setError(error instanceof Error ? error.message : '未知错误');
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedCrypto.symbol]);

  const handleNewAnalysis = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-center mb-6">分析进行中</h1>
              
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCrypto.logo}
                    alt={selectedCrypto.symbol}
                    className="w-8 h-8"
                  />
                  <span className="text-lg font-semibold">{selectedCrypto.symbol}</span>
                </div>
                
                {selectedAnalystInfo && (
                  <div className="flex items-center gap-3">
                    <img
                      src={`/src/assets/analysts/${selectedAnalystInfo.id}.jpeg`}
                      alt={selectedAnalystInfo.chineseName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-lg font-semibold">{selectedAnalystInfo.chineseName}</span>
                  </div>
                )}
              </div>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <p className="font-semibold">错误</p>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {agentStatuses.map((agentStatus) => (
                    <div 
                      key={agentStatus.agent} 
                      className={`bg-gray-50 rounded-lg p-4 transition-all duration-300 ${
                        agentStatus.isComplete ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">{agentStatus.agent}</h3>
                        <div className="flex items-center gap-3">
                          <p className="text-gray-700 text-sm">{agentStatus.status}</p>
                          {agentStatus.isComplete ? (
                            <div className="flex items-center justify-center w-6 h-6">
                              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6">
                              <div className="relative w-6 h-6">
                                <div className="absolute inset-0 border-2 border-blue-200 rounded-full"></div>
                                <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {analysisResult && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">分析结果</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {analysisCompleted && (
                  <div className="mt-8 space-y-8 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h1 className="text-2xl font-bold text-gray-800 mb-6">加密货币基本面分析报告</h1>
                      
                      <div className="bg-blue-50 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-blue-800 mb-4">决策概览</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">操作建议</span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">持有</span>
                            </div>
                            <p className="text-sm text-gray-500">检测到看涨信号但受仓位限制</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">建议数量</span>
                              <span className="text-gray-800 font-medium">0</span>
                            </div>
                            <p className="text-sm text-gray-500">当前可操作数量</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">置信度</span>
                              <span className="text-gray-800 font-medium">32%</span>
                            </div>
                            <p className="text-sm text-gray-500">策略判断的确定性程度</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">操作理由</span>
                            </div>
                            <p className="text-sm text-gray-500">存在看涨信号，但最大可购买数量为0。尽管有可用资金，仍无法执行买入操作</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-xl font-semibold text-gray-800 mb-4">技术分析信号（BTC-USDT）</h2>
                          
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-3">趋势跟踪策略</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号方向</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">平均趋向指数(ADX)</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">29.49</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">看涨</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">29%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">趋势强度</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.295</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-3">均值回归策略</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号方向</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">Z分数</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">1.475</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">中性</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">50%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">价格vs布林带</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.731</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">RSI(14日)</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">72.13</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">RSI(28日)</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">77.36</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-3">动量策略</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号方向</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">1月动量</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.0925</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">中性</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">50%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">3月动量</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.2234</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">6月动量</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">成交量动量</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.1868</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-3">波动率策略</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号方向</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">历史波动率</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.2816</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">看涨</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">46%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">波动率周期</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.6406</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">波动率Z分数</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-1.3858</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">ATR比率</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.0263</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium text-gray-700 mb-3">统计套利策略</h3>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标名称</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">信号方向</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">赫斯特指数</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">4.42e-15</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">中性</span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">50%</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">偏度</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">0.7301</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                      <td className="px-4 py-3 text-sm text-gray-900">峰度</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">2.1022</td>
                                      <td className="px-4 py-3 text-sm">-</td>
                                      <td className="px-4 py-3 text-sm text-gray-900">-</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6">
                          <h2 className="text-xl font-semibold text-gray-800 mb-4">风险管理参数（BTC-USDT）</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">剩余仓位限额</span>
                              <p className="text-lg font-semibold text-gray-900">¥20,000.00</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">当前价格</span>
                              <p className="text-lg font-semibold text-gray-900">¥103,470.59</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">投资组合总值</span>
                              <p className="text-lg font-semibold text-gray-900">¥100,000.00</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">比特币持仓数量</span>
                              <p className="text-lg font-semibold text-gray-900">3.00 BTC</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">仓位上限</span>
                              <p className="text-lg font-semibold text-gray-900">¥20,000.00</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <span className="text-sm text-gray-500">可用现金</span>
                              <p className="text-lg font-semibold text-gray-900">¥100,000.00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading && analysisResult && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleNewAnalysis}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      再次分析
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;