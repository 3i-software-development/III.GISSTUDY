USE [SmartWork]
GO
/****** Object:  Table [dbo].[gadm41_VNM_3]    Script Date: 3/6/2023 3:11:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[gadm41_VNM_3](
	[type] [nvarchar](50) NULL,
	[name] [nvarchar](50) NULL,
	[crs] [nvarchar](100) NULL,
	[features] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VN_Huyen]    Script Date: 3/6/2023 3:11:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VN_Huyen](
	[ID_0] [tinyint] NULL,
	[ISO] [nvarchar](50) NULL,
	[NAME_0] [nvarchar](50) NULL,
	[ID_1] [tinyint] NULL,
	[NAME_1] [nvarchar](50) NULL,
	[ID_2] [smallint] NULL,
	[NAME_2] [nvarchar](50) NULL,
	[HASC_2] [nvarchar](50) NULL,
	[CCN_2] [tinyint] NULL,
	[TYPE_2] [nvarchar](50) NULL,
	[ENGTYPE_2] [nvarchar](50) NULL,
	[VARNAME_2] [nvarchar](50) NULL,
	[CCA_2] [nvarchar](1) NULL,
	[NL_NAME_2] [nvarchar](1) NULL,
	[WKT] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
