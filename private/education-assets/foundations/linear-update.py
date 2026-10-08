"""One gradient update, using Python only."""
x, y = 2.0, 5.0
w, b, learning_rate = 1.0, 0.0, 0.1
prediction = w*x+b
loss = (prediction-y)**2
gradient = 2*(prediction-y)*x
new_w = w-learning_rate*gradient
new_loss = (new_w*x+b-y)**2
print(f'prediction={prediction:.1f} loss={loss:.2f} gradient={gradient:.1f}')
print(f'w: {w:.1f} -> {new_w:.1f}; loss: {loss:.2f} -> {new_loss:.2f}')
assert new_loss < loss
