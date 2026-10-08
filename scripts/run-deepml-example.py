"""Train a small CPU network on synthetic range calibration data; export real results."""
from pathlib import Path
import hashlib
import json
import platform
import warnings

warnings.filterwarnings("ignore", message="Unable to import Axes3D.*")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
import torch
from torch import nn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "private/education-assets/deepml"
OUT.mkdir(parents=True, exist_ok=True)
torch.manual_seed(1409)
torch.set_num_threads(1)

def samples(count):
    measured = torch.rand(count, 1)
    target = 0.15 + 0.7 * measured + 0.08 * torch.sin(2 * torch.pi * measured)
    return measured, target + 0.005 * torch.randn_like(target)

train_x, train_y = samples(96)
val_x, val_y = samples(32)
test_x, test_y = samples(32)
model = nn.Sequential(nn.Linear(1, 8), nn.ReLU(), nn.Linear(8, 8), nn.ReLU(), nn.Linear(8, 1))
loss_fn = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
records = []
best_val = float("inf")
best_state = None
initial_prediction = model(test_x).detach()

# BEGIN LESSON CODE
for epoch in range(401):
    model.train()
    prediction = model(train_x)
    loss = loss_fn(prediction, train_y)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    model.eval()
    with torch.no_grad():
        validation_loss = loss_fn(model(val_x), val_y).item()
    if validation_loss < best_val:
        best_val = validation_loss
        best_state = {key: value.clone() for key, value in model.state_dict().items()}
    records.append({"epoch": epoch, "train_mse": loss.item(), "validation_mse": validation_loss})
# END LESSON CODE

model.load_state_dict(best_state)
model.eval()
with torch.no_grad():
    test_prediction = model(test_x)
    shifted_prediction = model(test_x + 0.12)
    mae = (test_prediction - test_y).abs().mean().item()
    shifted_mae = (shifted_prediction - test_y).abs().mean().item()
    initial_mae = (initial_prediction - test_y).abs().mean().item()

design = torch.cat([train_x, torch.ones_like(train_x)], dim=1)
linear_parameters = torch.linalg.lstsq(design, train_y).solution
linear_prediction = torch.cat([test_x, torch.ones_like(test_x)], dim=1) @ linear_parameters
linear_mae = (linear_prediction - test_y).abs().mean().item()

font = FontProperties(fname="/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc")
plt.rcParams.update({"font.family": font.get_name(), "font.size": 12, "axes.spines.top": False,
                     "axes.spines.right": False, "axes.unicode_minus": False})

fig, ax = plt.subplots(figsize=(9, 4.6), constrained_layout=True)
ax.plot([r["epoch"] for r in records], [r["train_mse"] for r in records], color="#1640a8", label="학습 데이터")
ax.plot([r["epoch"] for r in records], [r["validation_mse"] for r in records], color="#008b7d", label="검증 데이터")
ax.set(xlabel="학습 반복 횟수", ylabel="평균 제곱 오차 (m²)", title="합성 거리 보정 · 학습과 검증 손실")
ax.set_yscale("log")
ax.grid(alpha=.18)
ax.legend(frameon=False)
fig.savefig(OUT / "training.png", dpi=160)
plt.close(fig)

fig, axes = plt.subplots(1, 2, figsize=(10, 4.6), constrained_layout=True)
for ax, pred, title in [(axes[0], test_prediction, "같은 센서 조건의 test 데이터"),
                       (axes[1], shifted_prediction, "입력에 0.12 m 편향을 추가한 조건")]:
    ax.scatter(test_y.numpy(), pred.numpy(), s=36, color="#1640a8", alpha=.85)
    ax.plot([0, 1.1], [0, 1.1], color="#008b7d", linestyle="--", label="예측 = 정답")
    ax.set(xlabel="정답 거리 (m)", ylabel="예측 거리 (m)", title=title, xlim=(0, 1.1), ylim=(0, 1.1))
    ax.set_aspect("equal")
    ax.grid(alpha=.18)
axes[0].legend(frameon=False)
fig.savefig(OUT / "evaluation.png", dpi=160)
plt.close(fig)

source = Path(__file__).read_text()
result = {"seed": 1409, "python": platform.python_version(), "torch": torch.__version__, "device": "cpu",
          "input": "synthetic range calibration; no hardware measurements", "train": 96, "validation": 32, "test": 32,
          "linear_test_mae_cm": linear_mae * 100, "linear_parameters": linear_parameters.flatten().tolist(),
          "initial_test_mae_cm": initial_mae * 100, "test_mae_cm": mae * 100, "shifted_test_mae_cm": shifted_mae * 100,
          "epochs": 401, "selected_epoch": min(records, key=lambda row: row["validation_mse"])["epoch"],
          "source_sha256": hashlib.sha256(source.encode()).hexdigest(), "history": records}
(OUT / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({key: value for key, value in result.items() if key != "history"}, ensure_ascii=False, indent=2))
