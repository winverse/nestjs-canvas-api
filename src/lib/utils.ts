class Utils {
  static randomNumber(max): number {
    const random: number = Math.floor(Math.random() * (max + 1));
    return random;
  }
}

export default Utils;
