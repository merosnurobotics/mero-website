"""RViz adapter for the stationary synthetic scan; publishes estimated map -> laser."""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import PoseStamped, TransformStamped
from tf2_ros import TransformBroadcaster
rclpy.init()
node=Node('meroedu_capture_pose_tf')
broadcaster=TransformBroadcaster(node)
def receive(pose):
    transform=TransformStamped()
    transform.header=pose.header
    transform.child_frame_id='laser'
    transform.transform.translation.x=pose.pose.position.x
    transform.transform.translation.y=pose.pose.position.y
    transform.transform.rotation=pose.pose.orientation
    broadcaster.sendTransform(transform)
subscription=node.create_subscription(PoseStamped,'/meroedu/pose',receive,10)
try: rclpy.spin(node)
except KeyboardInterrupt: pass
finally:
    node.destroy_node()
    if rclpy.ok(): rclpy.shutdown()
