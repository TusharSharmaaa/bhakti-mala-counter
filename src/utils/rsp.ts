import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Base width 375 (iPhone X baseline)
export const scale = (n: number): number => (width / 375) * n;


