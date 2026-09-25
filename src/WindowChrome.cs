using System.Runtime.InteropServices;

using Photino.NET;

namespace Noisescape;

static class WindowChrome {

  const int GWLP_WNDPROC = -4;
  const int GWL_STYLE = -16;
  const long WS_CAPTION = 0x00C00000;
  const uint WM_GETMINMAXINFO = 0x0024;
  const uint WM_NCCALCSIZE = 0x0083;
  const int MONITOR_DEFAULTTONEAREST = 2;
  const uint SWP_NOSIZE = 0x0001;
  const uint SWP_NOMOVE = 0x0002;
  const uint SWP_NOZORDER = 0x0004;
  const uint SWP_NOACTIVATE = 0x0010;
  const uint SWP_FRAMECHANGED = 0x0020;
  const int SM_CXSIZEFRAME = 32;
  const int SM_CXPADDEDBORDER = 92;
  const int SW_MAXIMIZE = 3;
  const int SW_RESTORE = 9;

  static IntPtr originalProc;
  static WindowProc hook = Hook;

  delegate IntPtr WindowProc(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);

  [StructLayout(LayoutKind.Sequential)]
  struct RECT {
    public int Left, Top, Right, Bottom;
  }

  [StructLayout(LayoutKind.Sequential)]
  struct POINT {
    public int X, Y;
  }

  [StructLayout(LayoutKind.Sequential)]
  struct MINMAXINFO {
    public POINT ptReserved, ptMaxSize, ptMaxPosition, ptMinTrackSize, ptMaxTrackSize;
  }

  [StructLayout(LayoutKind.Sequential)]
  struct MONITORINFO {
    public int cbSize;
    public RECT rcMonitor;
    public RECT rcWork;
    public int dwFlags;
  }

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  static extern IntPtr SetWindowLongPtr(IntPtr hwnd, int nIndex, IntPtr dwNewLong);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  static extern IntPtr GetWindowLongPtr(IntPtr hwnd, int nIndex);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  static extern IntPtr CallWindowProc(IntPtr prevWndProc, IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);

  [DllImport("user32.dll")]
  static extern bool SetWindowPos(IntPtr hwnd, IntPtr insertAfter, int x, int y, int cx, int cy, uint flags);

  [DllImport("user32.dll")]
  static extern IntPtr MonitorFromWindow(IntPtr hwnd, uint flags);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  static extern bool GetMonitorInfo(IntPtr monitor, ref MONITORINFO info);

  [DllImport("user32.dll")]
  static extern int GetSystemMetricsForDpi(int index, uint dpi);

  [DllImport("user32.dll")]
  static extern uint GetDpiForWindow(IntPtr hwnd);

  [DllImport("user32.dll")]
  static extern bool IsZoomed(IntPtr hwnd);

  [DllImport("user32.dll")]
  static extern bool ShowWindow(IntPtr hwnd, int cmdShow);

  public static bool IsMaximised(PhotinoWindow window) {
    return IsZoomed(window.WindowHandle);
  }

  public static void SetMaximised(PhotinoWindow window, bool maximised) {
    ShowWindow(window.WindowHandle, maximised ? SW_MAXIMIZE : SW_RESTORE);
  }

  public static void ToggleMaximise(PhotinoWindow window) {
    SetMaximized(window, !IsMaximised(window));
  }

  public static void Install(PhotinoWindow window) {
    IntPtr hwnd = window.WindowHandle;

    originalProc = SetWindowLongPtr(hwnd, GWLP_WNDPROC, Marshal.GetFunctionPointerForDelegate(hook));

    long style = GetWindowLongPtr(hwnd, GWL_STYLE).ToInt64() | WS_CAPTION;
    SetWindowLongPtr(hwnd, GWL_STYLE, new IntPtr(style));
    SetWindowPos(hwnd, IntPtr.Zero, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE | SWP_FRAMECHANGED);
  }

  static IntPtr Hook(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam) {
    if (message == WM_NCCALCSIZE) {
      if (wParam != IntPtr.Zero) {
        uint dpi = GetDpiForWindow(hwnd);
        int frame = GetSystemMetricsForDpi(SM_CXSIZEFRAME, dpi) + GetSystemMetricsForDpi(SM_CXPADDEDBORDER, dpi);
        RECT rect = Marshal.PtrToStructure<RECT>(lParam);
        rect.Left += frame;
        rect.Top += frame;
        rect.Right -= frame;
        rect.Bottom -= frame;
        Marshal.StructureToPtr(rect, lParam, false);
      }
      return IntPtr.Zero;
    }

    IntPtr result = CallWindowProc(originalProc, hwnd, message, wParam, lParam);

    if (message == WM_GETMINMAXINFO) {
      MONITORINFO info = new MONITORINFO();
      info.cbSize = Marshal.SizeOf<MONITORINFO>();
      if (GetMonitorInfo(MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST), ref info)) {
        MINMAXINFO minMax = Marshal.PtrToStructure<MINMAXINFO>(lParam);
        minMax.ptMaxPosition.X = info.rcWork.Left;
        minMax.ptMaxPosition.Y = info.rcWork.Top;
        minMax.ptMaxSize.X = info.rcWork.Right - info.rcWork.Left;
        minMax.ptMaxSize.Y = info.rcWork.Bottom - info.rcWork.Top;
        Marshal.StructureToPtr(minMax, lParam, false);
      }
    }

    return result;
  }

}
