"""Compare P, PI and PID on the same synthetic motor-speed model."""
import argparse
import csv
import json
from pathlib import Path

def simulate(kp, ki, kd):
    dt=.01
    speed=drive=integral=previous=derivative=0.
    rows=[]
    for step in range(801):
        time=step*dt;goal=1. if time>=1 else 0.;load=.5 if time>=4 else 0.
        error=goal-speed
        integral=max(-1,min(1,integral+error*dt))
        # Derivative on measured speed, low-pass filtered; avoids setpoint kick.
        derivative=.8*derivative+.2*(speed-previous)/dt
        command=max(-1,min(1,kp*error+ki*integral-kd*derivative))
        rows.append({'time_s':time,'goal_rad_s':goal,'speed_rad_s':speed,'output':command})
        previous=speed
        drive+=(command-drive)*dt/.08
        speed+=(3*drive-speed-load)*dt/.5
    return rows

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--kp',type=float,default=1.2);parser.add_argument('--ki',type=float,default=4.5);parser.add_argument('--kd',type=float,default=.14);parser.add_argument('--output',default='results');args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11})
    fig, axes=plt.subplots(2,1,figsize=(10,6.5),sharex=True,layout='constrained')
    metrics={}
    for label,gains,color in [('P',(args.kp,0,0),'#b06f24'),('PI',(args.kp,args.ki,0),'#168472'),('PID',(args.kp,args.ki,args.kd),'#214fc4')]:
        rows=simulate(*gains)
        with (out/f'{label.lower()}.csv').open('w') as file:
            writer=csv.DictWriter(file,fieldnames=list(rows[0]),lineterminator="\n");writer.writeheader();writer.writerows(rows)
        axes[0].plot([r['time_s'] for r in rows],[r['speed_rad_s'] for r in rows],label=label,color=color)
        axes[1].plot([r['time_s'] for r in rows],[r['output'] for r in rows],label=label,color=color)
        metrics[label]={'gains':gains,'overshoot_pct_before_load':max(0,100*(max(r['speed_rad_s'] for r in rows if 1<=r['time_s']<4)-1)),'mean_error_last_second_rad_s':sum(1-r['speed_rad_s'] for r in rows if r['time_s']>=7)/101}
    axes[0].plot([r['time_s'] for r in rows],[r['goal_rad_s'] for r in rows],'--',color='#444',label='Target')
    for ax in axes:
        ax.axvline(4,linestyle=':',color='#777',label='Load added at 4 s');ax.grid(alpha=.15);ax.legend(ncol=5,fontsize=9)
    axes[0].set(ylabel='Speed (rad/s)',title='Same synthetic motor: P / PI / PID')
    axes[1].set(xlabel='Time (s)',ylabel='Drive command (-1 to 1)')
    fig.savefig(out/'pid-response.png',dpi=150);plt.close(fig)
    result={'dt_s':.01,'plant':'drive lag .08 s; speed lag .5 s; steady gain 3 rad/s per unit drive','load_change':{'time_s':4,'value':.5},'scope':'synthetic motor; not hardware validation','metrics':metrics}
    (out/'pid-response.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
