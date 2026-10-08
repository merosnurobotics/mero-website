"""Numerical unit and frame examples, using Python only."""
import math
print('rpm_to_rad_s', 60 * 2 * math.pi / 60)
x, y, yaw = 1.0, 0.0, math.pi / 2
print('map_point', (2 + math.cos(yaw)*x - math.sin(yaw)*y,
                    1 + math.sin(yaw)*x + math.cos(yaw)*y))
