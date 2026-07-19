import { useEffect, useMemo, useState } from 'react';
import { Lock, Radio, Settings2 } from 'lucide-react';
import { mdcApi } from '../services/api';
import { mdcSocket } from '../services/socket';

export function AdminPanel() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [intensity, setIntensity] = useState<any>(null);
  const [auth, setAuth] = useState({ username: 'admin', password: '' });
  const [status, setStatus] = useState('');
  const [pings, setPings] = useState<Record<string, 'alive' | 'connect_error'>>({});
  const [socketConnected, setSocketConnected] = useState(mdcSocket.isConnected());

  useEffect(() => {
    const load = async () => {
      const [nodeRes, intensityRes] = await Promise.all([
        mdcApi.getAllNodeInfo(),
        mdcApi.getIntensitySettings()
      ]);
      setNodes(nodeRes.data || []);
      setIntensity(intensityRes.data || null);
    };
    load();

    mdcSocket.registerListeners({
      onIpPing: (ip, ipStatus) => {
        setPings((current) => ({ ...current, [ip]: ipStatus }));
      },
      onStatusChange: setSocketConnected
    });
  }, []);

  // IPs actually configured on the fetched nodes — no hardcoded/fabricated list
  const monitoredIps = useMemo(() => {
    const ips = new Set<string>();
    nodes.forEach((n) => {
      if (n.sensor_ip) ips.add(n.sensor_ip);
      if (n.monitor_ip) ips.add(n.monitor_ip);
    });
    return Array.from(ips);
  }, [nodes]);

  const currentNode = useMemo(() => nodes[0], [nodes]);

  const updateNodeField = (field: string, value: string | number) => {
    setNodes((currentNodes) =>
      currentNodes.map((item) =>
        item.node_id === currentNode?.node_id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await mdcApi.loginUser(auth.username, auth.password);
    setStatus(result.success ? 'Access granted' : result.error || 'Unable to authenticate');
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentNode) return;
    await mdcApi.updateNodeConfig({
      node_id: currentNode.node_id,
      positive_x_magni: currentNode.positive_x_magni,
      positive_y_magni: currentNode.positive_y_magni,
      positive_z_magni: currentNode.positive_z_magni,
      sensor_ip: currentNode.sensor_ip,
      monitor_ip: currentNode.monitor_ip,
      node_token: currentNode.node_token
    });
    await mdcApi.updateIntensity({
      warning_min: intensity.warning_min,
      alert_min: intensity.alert_min,
      green_light: intensity.green_light,
      yellow_light: intensity.yellow_light,
      red_light: intensity.red_light
    });
    setStatus('Settings saved');
  };

  return (
    <div className="app-shell admin-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Tech support access</p>
          <h1>Administrative controls</h1>
        </div>
        <div className="status-pill live"><span className="pulse-dot" /> {socketConnected ? 'Live' : 'Mock Feed Active'}</div>
      </header>

      <main className="admin-grid">
        <section className="panel-card form-card">
          <div className="panel-title-row">
            <h3>Node coefficients & IPs</h3>
            <span className="chip chip-blue"><Settings2 size={14} /> Configure</span>
          </div>
          {currentNode ? (
            <form className="form-stack" onSubmit={handleSave}>
              <label>
                Positive X multiplier
                <input
                  type="number"
                  step="0.001"
                  value={currentNode.positive_x_magni}
                  onChange={(event) => updateNodeField('positive_x_magni', Number(event.target.value))}
                />
              </label>
              <label>
                Positive Y multiplier
                <input
                  type="number"
                  step="0.001"
                  value={currentNode.positive_y_magni}
                  onChange={(event) => updateNodeField('positive_y_magni', Number(event.target.value))}
                />
              </label>
              <label>
                Positive Z multiplier
                <input
                  type="number"
                  step="0.001"
                  value={currentNode.positive_z_magni}
                  onChange={(event) => updateNodeField('positive_z_magni', Number(event.target.value))}
                />
              </label>
              <label>
                Sensor IP
                <input value={currentNode.sensor_ip} onChange={(event) => updateNodeField('sensor_ip', event.target.value)} />
              </label>
              <label>
                Monitor IP
                <input value={currentNode.monitor_ip} onChange={(event) => updateNodeField('monitor_ip', event.target.value)} />
              </label>
              <label>
                Warning threshold
                <input type="number" value={intensity?.warning_min || 4} onChange={(event) => setIntensity((value: any) => ({ ...value, warning_min: Number(event.target.value) }))} />
              </label>
              <label>
                Alert threshold
                <input type="number" value={intensity?.alert_min || 6} onChange={(event) => setIntensity((value: any) => ({ ...value, alert_min: Number(event.target.value) }))} />
              </label>
              <button type="submit">Save settings</button>
            </form>
          ) : null}
        </section>

        <section className="panel-card form-card">
          <div className="panel-title-row">
            <h3>Authentication & pings</h3>
            <span className="chip chip-green"><Radio size={14} /> Live</span>
          </div>
          <form className="form-stack" onSubmit={handleLogin}>
            <label>
              Username
              <input value={auth.username} onChange={(event) => setAuth({ ...auth, username: event.target.value })} />
            </label>
            <label>
              Password
              <input type="password" value={auth.password} onChange={(event) => setAuth({ ...auth, password: event.target.value })} />
            </label>
            <button type="submit"><Lock size={16} /> Sign in</button>
          </form>
          {status ? <p className="status-text">{status}</p> : null}

          <div className="ping-list">
            {monitoredIps.map((ip) => {
              const pingStatus = pings[ip];
              return (
                <div key={ip} className="ping-row">
                  <span>{ip}</span>
                  <span className={`pill ${pingStatus === 'alive' ? 'pill-good' : 'pill-warn'}`}>
                    {pingStatus || 'awaiting ping'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
