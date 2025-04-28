import unittest
import pandas as pd
from gps_anomaly_detection import generate_real_time_data, model

class TestAnomalyDetection(unittest.TestCase):
    def test_generate_real_time_data_shape(self):
        data = generate_real_time_data(n=5)
        self.assertEqual(data.shape, (5, 5))

    def test_anomaly_prediction_output(self):
        data = generate_real_time_data(n=1)
        prediction = model.predict(data)
        self.assertIn(prediction[0], [1, -1])  # 1 = normal, -1 = anomaly

    def test_data_columns(self):
        data = generate_real_time_data()
        expected_columns = ['location-lat', 'location-long', 'argos:sensor-1', 'argos:sensor-2', 'argos:sensor-3']
        self.assertListEqual(list(data.columns), expected_columns)

if __name__ == '__main__':
    unittest.main()
