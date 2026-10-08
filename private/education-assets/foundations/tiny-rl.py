"""Two actions, a tiny policy-gradient learner and explicit time-limit semantics."""
import math
import random

class Corridor:
    def reset(self):
        self.position, self.steps, self.finished = 2, 0, False
        return self.position, {}
    def step(self, action):
        if self.finished: raise RuntimeError("reset before another step")
        if action not in (0, 1): raise ValueError("action must be 0 or 1")
        self.position += 1 if action == 1 else -1
        self.steps += 1
        terminated = self.position in (0, 4)
        truncated = self.steps >= 8 and not terminated
        self.finished = terminated or truncated
        reward = 5.0 if self.position == 4 else -2.0 if self.position == 0 else -0.1
        return self.position, reward, terminated, truncated, {}

def probability(logit):
    return 1/(1+math.exp(-logit))

def episode(env, logits, rng, greedy=False):
    state, _ = env.reset()
    trace=[]
    while True:
        p=probability(logits[state])
        action=int(p >= .5) if greedy else int(rng.random() < p)
        next_state, reward, terminated, truncated, _=env.step(action)
        trace.append((state,action,reward,p,next_state,terminated,truncated))
        state=next_state
        if terminated or truncated: return trace

def returns(trace, gamma=.9, final_value=0.):
    # Only true termination removes the final-state value. No reset-state value is used.
    carry=0. if trace[-1][5] else final_value
    result=[]
    for row in reversed(trace):
        carry=row[2]+gamma*carry;result.append(carry)
    return list(reversed(result))

def policy_values(logits, gamma=.9):
    # Exact expected values for this known three-state toy model, not a neural critic.
    value=[0.]*5
    for _ in range(300):
        updated=value.copy()
        for state in (1,2,3):
            p=probability(logits[state])
            left=-2. if state==1 else -.1+gamma*value[state-1]
            right=5. if state==3 else -.1+gamma*value[state+1]
            updated[state]=(1-p)*left+p*right
        if max(abs(a-b) for a,b in zip(value,updated))<1e-10: return updated
        value=updated
    return value

if __name__=='__main__':
    rng=random.Random(514);env=Corridor();logits=[0.]*5
    for _ in range(300):
        trace=episode(env,logits,rng)
        final_value=policy_values(logits)[trace[-1][4]]
        for row, value in zip(trace,returns(trace, final_value=final_value)):
            state, action, _, p, *_=row
            logits[state]=max(-5,min(5,logits[state]+.03*(action-p)*value))
    random_runs=[episode(env,[0.]*5,random.Random(100+i)) for i in range(100)]
    learned_runs=[episode(env,logits,random.Random(100+i)) for i in range(100)]
    for label,runs in [('random',random_runs),('learned',learned_runs)]:
        wins=sum(run[-1][4]==4 for run in runs)
        values=policy_values([0.]*5 if label=='random' else logits)
        print(label, 'goal', f'{wins}/100', 'mean return', round(sum(returns(run,final_value=values[run[-1][4]])[0] for run in runs)/100,3))
    print('P(right) by state:', [round(probability(logits[i]),3) for i in (1,2,3)])
    print('reward sequence [1,1,10], gamma .9:', 1+.9*1+.9**2*10)
    print('time-limit target: reward 1 + .9 * final value 4 =', 1+.9*4)
    assert sum(run[-1][4]==4 for run in learned_runs)>sum(run[-1][4]==4 for run in random_runs)
    env.reset()
    for i in range(8):
        _,_,terminated,truncated,_=env.step(1 if i%2==0 else 0)
    assert truncated and not terminated
