import {
  buildCaptionTextStyle,
  buildCaptionWindowStyle,
  buildCaptionBgStyle,
} from '../src/utils/captionStyle';

describe('captionStyle utility', () => {
  it('should return default text styles when prefs are empty', () => {
    const style = buildCaptionTextStyle({});
    expect(style.color).toBe('#FFFFFF');
    expect(style.fontSize).toBe(22);
    expect(style.fontWeight).toBe('normal');
    expect(style.fontStyle).toBe('normal');
  });

  it('should apply bold and italic styling when fontStyle enum is set to 3', () => {
    const style = buildCaptionTextStyle({ fontStyle: 3 }); // FONT_STYLE_BOLD_ITALIC
    expect(style.fontWeight).toBe('bold');
    expect(style.fontStyle).toBe('italic');
  });

  it('should calculate fontSize scaling from fontScale and textSizeSp', () => {
    const style = buildCaptionTextStyle({ textSizeSp: 20, fontScale: 1.5 });
    expect(style.fontSize).toBe(30);
  });

  it('should map drop shadow edge type correctly', () => {
    const style = buildCaptionTextStyle({ edgeType: 2 }); // EDGE_DROP_SHADOW
    expect(style.textShadowOffset).toEqual({ width: 2, height: 2 });
    expect(style.textShadowRadius).toBe(4);
  });

  it('should build caption background and window styles', () => {
    const windowStyle = buildCaptionWindowStyle({});
    expect(windowStyle.paddingHorizontal).toBe(8);

    const bgStyle = buildCaptionBgStyle({});
    expect(bgStyle.paddingHorizontal).toBe(6);
    expect(bgStyle.borderRadius).toBe(3);
  });
});
